/**
 * get-task.ts
 *
 * Endpoints de gestion des tâches (Matrice).
 *
 * ## Routes
 * - GET /getTask       → Liste allégée (id, title, colId, createdAt)
 * - GET /getTask/:id   → Détail complet d'une tâche
 *
 * ## Codes HTTP
 * - 200 : Succès
 * - 401 : Non authentifié
 * - 404 : Tâche non trouvée (GET /:id)
 * - 500 : Erreur interne du serveur
 */

import { getColIdFromSqlId } from "@backend/src/config";
import { db } from "@backend/src/drizzle/connection/index";
import { cardsTable } from "@backend/src/drizzle/schemas/workspace";
import { createOpenAPIHono } from "@backend/src/lib/openapi";
import { getDbDateStr } from "@backend/utils/dateHelpers";
import { and, eq } from "drizzle-orm";
import { createLogger } from "@packages/shared/utils/logger";
import { getTasksRoute, getTaskDetailRoute } from "../task.router";
import { requirePermission } from "@backend/src/lib/auth-middleware";

const log = createLogger("kanban/get-task");

export async function getTasksByProject(projectId: string, userId: string) {
  try {
    const rows = await db
      .select({
        id: cardsTable.id,
        title: cardsTable.title,
        quadrant: cardsTable.quadrant,
        priorityLabel: cardsTable.priorityLabel,
        positionString: cardsTable.positionString,
        createdAt: cardsTable.createdAt,
      })
      .from(cardsTable)
      .where(
        and(eq(cardsTable.projectId, projectId), eq(cardsTable.userId, userId)),
      )
      .orderBy(cardsTable.positionString);

    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      colId: getColIdFromSqlId(row.quadrant),
      priority: row.priorityLabel || "none",
      positionString: row.positionString,
      createdAt:
        row.createdAt instanceof Date
          ? row.createdAt.toISOString()
          : getDbDateStr(),
    }));
  } catch (err) {
    log.error("[getTasksByProject] erreur DB", { projectId, error: err });
    throw err;
  }
}

export async function getTaskById(id: string, userId: string) {
  try {
    const rows = await db
      .select({
        id: cardsTable.id,
        title: cardsTable.title,
        description: cardsTable.description,
        quadrant: cardsTable.quadrant,
        positionString: cardsTable.positionString,
        priorityLabel: cardsTable.priorityLabel,
        createdAt: cardsTable.createdAt,
        updatedAt: cardsTable.updatedAt,
      })
      .from(cardsTable)
      .where(and(eq(cardsTable.id, id), eq(cardsTable.userId, userId)))
      .limit(1);

    const row = rows[0];

    // Garenti que Row ne soit pas vide silencieusement
    if (!row) {
      log.error("[getTaskById] Task not found", { taskId: id, status: 404 })
      return null;
    }

    return {
      id: row.id,
      title: row.title,
      description: row.description ?? "",
      colId: getColIdFromSqlId(row.quadrant),
      priority: row.priorityLabel ?? "none",
      positionString: row.positionString,
      createdAt:
        row.createdAt instanceof Date
          ? row.createdAt.toISOString()
          : getDbDateStr(),
      updatedAt:
        row.updatedAt instanceof Date ? row.updatedAt.toISOString() : undefined,
    };
  } catch (err) {
    log.error("[getTaskById] get task error", { id, error: err });
    throw err;
  }
}

// ─── Handlers ───────────────────────────────────────────────────────

const app = createOpenAPIHono();
app.use(requirePermission({ task: ["read"] }));

  /**
   * GET /getTask — Liste allégée
   * Sélectionne uniquement : id, title, quadrant (= colId), createdAt
   * Ne transporte pas : description, updatedAt
   */
  app.openapi(getTasksRoute, async (c) => {
    const user = c.get("user");

    const { projectId, limit, offset } = c.req.valid("query");

    try {
      const rows = await db
        .select({
          id: cardsTable.id,
          title: cardsTable.title,
          quadrant: cardsTable.quadrant,
          positionString: cardsTable.positionString,
          createdAt: cardsTable.createdAt,
        })
        .from(cardsTable)
        .where(
          and(
            eq(cardsTable.userId, user.id),
            eq(cardsTable.projectId, projectId),
          ),
        )
        .orderBy(cardsTable.positionString)
        .limit(limit)
        .offset(offset);

      const tasks = rows.map((row) => ({
        id: row.id,
        title: row.title,
        colId: getColIdFromSqlId(row.quadrant),
        positionString: row.positionString,
        createdAt:
          row.createdAt instanceof Date
            ? row.createdAt.toISOString()
            : getDbDateStr(),
      }));

      return c.json(tasks, 200);
    } catch (err) {
      log.error("[GET /getTask] erreur DB", err);
      return c.json({ message: "Erreur interne du serveur" }, 500);
    }
  })

  /**
   * GET /getTask/:id — Détail complet
   * Sélectionne tous les champs nécessaires au formulaire d'édition.
   */
  app.openapi(getTaskDetailRoute, async (c) => {
    const user = c.get("user");

    const { id } = c.req.valid("param");

    try {
      const rows = await db
        .select({
          id: cardsTable.id,
          title: cardsTable.title,
          description: cardsTable.description,
          quadrant: cardsTable.quadrant,
          positionString: cardsTable.positionString,
          priorityLabel: cardsTable.priorityLabel,
          createdAt: cardsTable.createdAt,
          updatedAt: cardsTable.updatedAt,
        })
        .from(cardsTable)
        .where(and(eq(cardsTable.id, id), eq(cardsTable.userId, user.id)))
        .limit(1);

      const row = rows[0];

      if (!row) {
        return c.json({ message: "Task no found" }, 404);
      }

      const task = {
        id: row.id,
        title: row.title,
        description: row.description ?? "",
        colId: getColIdFromSqlId(row.quadrant),
        priority: row.priorityLabel ?? "none",
        positionString: row.positionString,
        createdAt:
          row.createdAt instanceof Date
            ? row.createdAt.toISOString()
            : getDbDateStr(),
        updatedAt:
          row.updatedAt instanceof Date
            ? row.updatedAt.toISOString()
            : undefined,
      };

      return c.json(task, 200);
    } catch (err) {
      log.error("[GET /getTask/:id] erreur DB", err);
      return c.json({ message: "Erreur interne du serveur" }, 500);
    }
  });

export default app;
