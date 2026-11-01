import {
  MoveTask,
  PositionImpossibleError,
} from "@backend/src/logique/column/indexactionTaskV2";
import { createLogger } from "@backend/src/logique/logging/logger";
import type { AppEnv } from "@backend/src/types/app-env";
import type { RouteHandler } from "@hono/zod-openapi";
import { updateTaskPositionRoute } from "../task.router";

const log = createLogger("kanban/updateTaskPosition");

/**
 * Handler du contrôleur — pattern kaneo : le contrôleur exporte une fonction,
 * l'instance est créée une seule fois par le module (kanban/index.ts).
 */
export const updateTaskPositionHandler: RouteHandler<
  typeof updateTaskPositionRoute,
  AppEnv
> = async (c) => {
  const user = c.get("user");

  try {
    const { id } = c.req.valid("param");
    const { colId, overTaskId, insertBefore } = c.req.valid("json");

    const newPosition = await MoveTask(
      id,
      user.id,
      colId,
      overTaskId,
      insertBefore,
    );

    return c.json({ success: true, newPosition }, 200);
  } catch (err: unknown) {
    if (err instanceof PositionImpossibleError) {
      log.warn("[PATCH /updateTaskPosition] impossible position", {
        taskId: c.req.valid("param").id,
      });
      return c.json({ message: err.message }, 409);
    }
    if (err instanceof Error && err.message === "TASK_NOT_FOUND") {
      return c.json({ message: "Task not found" }, 404);
    }
    if (err instanceof Error && err.message === "INVALID_NEIGHBORS") {
      return c.json({ message: "Invalid neighbouring tasks" }, 400);
    }
    if (err instanceof Error && err.message === "MISSING_TARGET_COLUMN") {
      return c.json({ message: "colId is required" }, 400);
    }
    log.error("[PATCH /updateTaskPosition] error", err);
    return c.json({ message: "Internal server error" }, 500);
  }
};
