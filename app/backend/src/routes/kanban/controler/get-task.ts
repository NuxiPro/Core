/**
 * get-task.ts
 *
 * Task management endpoints (Matrix).
 *
 * ## Routes
 * - GET /getTask       → Lightweight list (id, title, colId, createdAt)
 * - GET /getTask/:id   → Full detail of a task
 *
 * ## HTTP codes
 * - 200: Success
 * - 401: Unauthenticated
 * - 404: Task not found (GET /:id)
 * - 500: Internal server error
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
        dueDate: cardsTable.dueDate,
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
      dueDate:
        row.dueDate instanceof Date ? row.dueDate.toISOString() : null,
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
        dueDate: cardsTable.dueDate,
        positionString: cardsTable.positionString,
        priorityLabel: cardsTable.priorityLabel,
        createdAt: cardsTable.createdAt,
        updatedAt: cardsTable.updatedAt,
      })
      .from(cardsTable)
      .where(and(eq(cardsTable.id, id), eq(cardsTable.userId, userId)))
      .limit(1);

    const row = rows[0];

    // Ensure row is not silently empty
    if (!row) {
      log.error("[getTaskById] Task not found", { taskId: id, status: 404 })
      return null;
    }

    return {
      id: row.id,
      title: row.title,
      description: row.description ?? "",
      colId: getColIdFromSqlId(row.quadrant),
      dueDate: row.dueDate instanceof Date ? row.dueDate.toISOString() : null,
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
   * GET /getTask — Lightweight list
   * Selects only: id, title, quadrant (= colId), createdAt
   * Does not carry: description, updatedAt
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
          dueDate: cardsTable.dueDate,
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
        dueDate: row.dueDate instanceof Date ? row.dueDate.toISOString() : null,
        createdAt:
          row.createdAt instanceof Date
            ? row.createdAt.toISOString()
            : getDbDateStr(),
      }));

      return c.json(tasks, 200);
    } catch (err) {
      log.error("[GET /getTask] DB error", err);
      return c.json({ message: "Internal server error" }, 500);
    }
  })

  /**
   * GET /getTask/:id — Full detail
   * Selects all fields needed by the edit form.
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
          dueDate: cardsTable.dueDate,
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
        return c.json({ message: "Task not found" }, 404);
      }

      const task = {
        id: row.id,
        title: row.title,
        description: row.description ?? "",
        colId: getColIdFromSqlId(row.quadrant),
        priority: row.priorityLabel ?? "none",
        dueDate: row.dueDate instanceof Date ? row.dueDate.toISOString() : null,
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
      log.error("[GET /getTask/:id] DB error", err);
      return c.json({ message: "Internal server error" }, 500);
    }
  });

export default app;
