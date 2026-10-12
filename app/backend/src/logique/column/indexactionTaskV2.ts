import { getColumnId } from "@backend/src/config";
import { db } from "@backend/src/drizzle/connection";
import { cardsTable } from "@backend/src/drizzle/schemas/workspace";
import type { Task } from "@packages/shared/types/task/task";
import { and, asc, desc, eq, gt, lt, ne } from "drizzle-orm";
import { generateKeyBetween } from "fractional-indexing";

export class PositionImpossibleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PositionImpossibleError";
  }
}

type DbTx = Parameters<Parameters<typeof db.transaction>[0]>[0];

// Rebalance du quadrant : réécrit les positionString en ordre serré
async function rebalanceQuadrant(
  tx: DbTx,
  userId: string,
  projectId: string,
  quadrant: number,
) {
  const rows = await tx
    .select({ id: cardsTable.id })
    .from(cardsTable)
    .where(
      and(
        eq(cardsTable.userId, userId),
        eq(cardsTable.projectId, projectId),
        eq(cardsTable.quadrant, quadrant),
      ),
    )
    .orderBy(asc(cardsTable.positionString));

  let prev: string | null = null;
  for (const row of rows) {
    const next = generateKeyBetween(prev, null);
    await tx
      .update(cardsTable)
      .set({ positionString: next, updatedAt: new Date() })
      .where(and(eq(cardsTable.id, row.id), eq(cardsTable.userId, userId)));
    prev = next;
  }
}

export async function MoveTask(
  taskId: Task["id"],
  userId: Task["userId"],
  colId: Task["colId"],
  overTaskId: string | null,
  insertBefore: boolean,
): Promise<string> {
  if (!colId) throw new Error("MISSING_TARGET_COLUMN");

  const targetQuadrant = getColumnId(colId);

  return await db.transaction(async (tx) => {
    // 1. Vérifie que la tâche à déplacer existe et récupère son projectId
    const [taskRows] = await tx
      .select({ id: cardsTable.id, projectId: cardsTable.projectId })
        .from(cardsTable)
        .where(and(eq(cardsTable.id, taskId), eq(cardsTable.userId, userId)))
        .limit(1);

    if (!taskRows) throw new Error("TASK_NOT_FOUND");
    const projectId = taskRows.projectId;

    // Garde : self-drop (le front l'aborte déjà via activeId === overId,
    // mais ne jamais générer une clé entre une tâche et elle-même).
    if (overTaskId !== null && overTaskId === taskId) {
      throw new PositionImpossibleError("Voisin invalide");
    }

    // 2. Valide overTaskId et récupère overPos
    let overPos: string | null = null;
    if (overTaskId) {
      const [overRows] = await tx
        .select({
          positionString: cardsTable.positionString,
          projectId: cardsTable.projectId,
          quadrant: cardsTable.quadrant,
        })
        .from(cardsTable)
        .where(and(eq(cardsTable.id, overTaskId), eq(cardsTable.userId, userId)))
        .limit(1);
      if (!overRows) throw new Error("TASK_NOT_FOUND");
      // Sécurité : overTask doit être dans le même projet ET la même colonne cible
      if (overRows.projectId !== projectId) throw new PositionImpossibleError("Voisin invalide");
      if (overRows.quadrant !== targetQuadrant) throw new PositionImpossibleError("Voisin invalide");
      overPos = overRows.positionString;
    }

    // 3. Voisins : scope commun qui exclut la tâche déplacée.
    // Sans le `ne`, un état stale (ou un move intra-colonne sans garde front)
    // peut prendre sa propre position comme voisine et générer une clé inutile.
    const scope = and(
      eq(cardsTable.userId, userId),
      eq(cardsTable.projectId, projectId),
      eq(cardsTable.quadrant, targetQuadrant),
      ne(cardsTable.id, taskId),
    );

    const findPrev = async (pos: string): Promise<string | null> => {
      const rows = await tx
        .select({ positionString: cardsTable.positionString })
        .from(cardsTable)
        .where(and(scope, lt(cardsTable.positionString, pos)))
        .orderBy(desc(cardsTable.positionString))
        .limit(1);
      return rows[0]?.positionString ?? null;
    };

    const findNext = async (pos: string): Promise<string | null> => {
      const rows = await tx
        .select({ positionString: cardsTable.positionString })
        .from(cardsTable)
        .where(and(scope, gt(cardsTable.positionString, pos)))
        .orderBy(asc(cardsTable.positionString))
        .limit(1);
      return rows[0]?.positionString ?? null;
    };

    // Dernière position du quadrant (tâche déplacée exclue) — pour l'append.
    const findLast = async (): Promise<string | null> => {
      const rows = await tx
        .select({ positionString: cardsTable.positionString })
        .from(cardsTable)
        .where(scope)
        .orderBy(desc(cardsTable.positionString))
        .limit(1);
      return rows[0]?.positionString ?? null;
    };

    // Résout prev/next en O(1) sans scan colonne.
    // overTaskId === null (colonne vide) → append après le dernier plutôt que
    // (null, null) qui régénère "a0" et collisionne en cas de race.
    const resolveNeighbors = async (
      over: string | null,
    ): Promise<{ prev: string | null; next: string | null }> => {
      if (over === null) return { prev: await findLast(), next: null };
      if (insertBefore) return { prev: await findPrev(over), next: over };
      return { prev: over, next: await findNext(over) };
    };

    let { prev: prevPos, next: nextPos } = await resolveNeighbors(overPos);

    // 4. Génération avec rebalance préventif + retry 23505
    const tryGenerate = (a: string | null, b: string | null) => {
      if ((a && a.length > 180) || (b && b.length > 180)) throw new Error("REBALANCE_NEEDED");
      return generateKeyBetween(a, b);
    };

    // Re-résout les voisins par id après un rebalance : toutes les positions
    // ont été réécrites, les anciennes strings sont invalides.
    const resolveAfterRebalance = async () => {
      if (overTaskId) {
        const [refetched] = await tx
          .select({ positionString: cardsTable.positionString })
          .from(cardsTable)
          .where(and(eq(cardsTable.id, overTaskId), eq(cardsTable.userId, userId)))
          .limit(1);
        overPos = refetched?.positionString ?? null;
      } else {
        overPos = null;
      }
      return resolveNeighbors(overPos);
    };

    let newPosition: string;
    try {
      newPosition = tryGenerate(prevPos, nextPos);
    } catch {
      await rebalanceQuadrant(tx, userId, projectId, targetQuadrant);
      ({ prev: prevPos, next: nextPos } = await resolveAfterRebalance());
      newPosition = generateKeyBetween(prevPos, nextPos);
    }

    try {
      await tx
        .update(cardsTable)
        .set({ positionString: newPosition, quadrant: targetQuadrant, updatedAt: new Date() })
        .where(and(eq(cardsTable.id, taskId), eq(cardsTable.userId, userId)));
    } catch (e: unknown) {
      // Collision uniqueIndex (userId, projectId, quadrant, positionString) → 23505
      const isUniqueViolation =
        e instanceof Error && (e.message.includes("23505") || (e as { code?: string }).code === "23505");
      if (isUniqueViolation) {
        await rebalanceQuadrant(tx, userId, projectId, targetQuadrant);
        ({ prev: prevPos, next: nextPos } = await resolveAfterRebalance());
        const retryPos = generateKeyBetween(prevPos, nextPos);
        await tx
          .update(cardsTable)
          .set({ positionString: retryPos, quadrant: targetQuadrant, updatedAt: new Date() })
          .where(and(eq(cardsTable.id, taskId), eq(cardsTable.userId, userId)));
        return retryPos;
      }
      throw e;
    }

    return newPosition;
  });
}
