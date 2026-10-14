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

// Quadrant rebalance: rewrites positionStrings in tight order
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
    // 1. Check that the task to move exists and get its projectId
    const [taskRows] = await tx
      .select({ id: cardsTable.id, projectId: cardsTable.projectId })
        .from(cardsTable)
        .where(and(eq(cardsTable.id, taskId), eq(cardsTable.userId, userId)))
        .limit(1);

    if (!taskRows) throw new Error("TASK_NOT_FOUND");
    const projectId = taskRows.projectId;

    // Guard: self-drop (the frontend already aborts it via activeId === overId,
    // but never generate a key between a task and itself).
    if (overTaskId !== null && overTaskId === taskId) {
      throw new PositionImpossibleError("Voisin invalide");
    }

    // 2. Validate overTaskId and get overPos
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
      // Safety: overTask must be in the same project AND the same target column
      if (overRows.projectId !== projectId) throw new PositionImpossibleError("Voisin invalide");
      if (overRows.quadrant !== targetQuadrant) throw new PositionImpossibleError("Voisin invalide");
      overPos = overRows.positionString;
    }

    // 3. Neighbors: shared scope excluding the moved task.
    // Without `ne`, a stale state (or an intra-column move without frontend guard)
    // could take its own position as neighbor and generate a useless key.
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

    // Last position of the quadrant (moved task excluded) — for append.
    const findLast = async (): Promise<string | null> => {
      const rows = await tx
        .select({ positionString: cardsTable.positionString })
        .from(cardsTable)
        .where(scope)
        .orderBy(desc(cardsTable.positionString))
        .limit(1);
      return rows[0]?.positionString ?? null;
    };

    // Resolve prev/next in O(1) without a column scan.
    // overTaskId === null (empty column) → append after the last one rather than
    // (null, null) which regenerates "a0" and collides in case of race.
    const resolveNeighbors = async (
      over: string | null,
    ): Promise<{ prev: string | null; next: string | null }> => {
      if (over === null) return { prev: await findLast(), next: null };
      if (insertBefore) return { prev: await findPrev(over), next: over };
      return { prev: over, next: await findNext(over) };
    };

    let { prev: prevPos, next: nextPos } = await resolveNeighbors(overPos);

    // 4. Generation with preventive rebalance + 23505 retry
    const tryGenerate = (a: string | null, b: string | null) => {
      if ((a && a.length > 180) || (b && b.length > 180)) throw new Error("REBALANCE_NEEDED");
      return generateKeyBetween(a, b);
    };

    // Re-resolve neighbors by id after a rebalance: all positions
    // have been rewritten, old strings are invalid.
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
      // uniqueIndex collision (userId, projectId, quadrant, positionString) → 23505
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
