import { db } from "@backend/src/drizzle/connection/index";
import { cardsTable } from "@backend/src/drizzle/schemas/workspace";
import type { RouteHandler } from "@hono/zod-openapi";
import type { AppEnv } from "@backend/src/types/app-env";
import { and, eq } from "drizzle-orm";
import { createLogger } from "@packages/shared/utils/logger";
import { deletedTaskRoute } from "../task.router";

const log = createLogger("kanban/delete-task");

/**
 * Handler du contrôleur — pattern kaneo : le contrôleur exporte une fonction,
 * l'instance est créée une seule fois par le module (kanban/index.ts).
 */
export const deletedTaskHandler: RouteHandler<typeof deletedTaskRoute, AppEnv> = async (c) => {
  // Authentication check
  const user = c.get("user");
  try {
    const { id } = c.req.valid("param");

    const deleted = await db
      .delete(cardsTable)
      .where(and(eq(cardsTable.id, id), eq(cardsTable.userId, user.id)))
      .returning({ id: cardsTable.id });

    if (deleted.length === 0) {
      log.warn("[deleted-task] Task not found", { taskId: id })
      return c.json({ message: "Task not found"}, 404)
    }

    return c.json({ success: true }, 200);
  } catch (err) {
    log.error("[DELETE /deletedTask] Failed to delete task", err);
    return c.json({ message: "Internal server error" }, 500);
  }
};
