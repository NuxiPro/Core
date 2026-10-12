import { requirePermission } from "@backend/src/lib/auth-middleware";
import { createOpenAPIHono } from "@backend/src/lib/openapi";
import {
  MoveTask,
  PositionImpossibleError,
} from "@backend/src/logique/column/indexactionTaskV2";
import { createLogger } from "@backend/src/logique/logging/logger";
import type { z } from "@hono/zod-openapi";
import { updateTaskPositionRoute } from "../task.router";
import type { UpdatePositionBody } from "../task.shemas";

const log = createLogger("kanban/updateTaskPosition");

const app = createOpenAPIHono();
app.use(requirePermission({ task: ["update"] }));
app.openapi(updateTaskPositionRoute, async (c) => {
  const user = c.get("user");

  try {
    const { id } = c.req.valid("param");
    const { colId, overTaskId, insertBefore } = c.req.valid("json") as z.infer<
      typeof UpdatePositionBody
    >;

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
      log.warn("[PATCH /updateTaskPosition] position impossible", {
        taskId: c.req.valid("param").id,
      });
      return c.json({ message: err.message }, 409);
    }
    if (err instanceof Error && err.message === "TASK_NOT_FOUND") {
      return c.json({ message: "Task not found" }, 404);
    }
    if (err instanceof Error && err.message === "INVALID_NEIGHBORS") {
      return c.json({ message: "Voisins invalides" }, 400);
    }
    if (err instanceof Error && err.message === "MISSING_TARGET_COLUMN") {
      return c.json({ message: "colId requis" }, 400);
    }
    log.error("[PATCH /updateTaskPosition] erreur", err);
    return c.json({ message: "Erreur serveur" }, 500);
  }
});

export default app;
