import { db } from "@backend/src/drizzle/connection/index";
import { cardsTable } from "@backend/src/drizzle/schemas/workspace";
import { createOpenAPIHono } from "@backend/src/lib/openapi";
import { and, eq } from "drizzle-orm";
import { createLogger } from "@packages/shared/utils/logger";
import { deletedTaskRoute } from "../task.router";
import { requirePermission } from "@backend/src/lib/auth-middleware";

const log = createLogger("kanban/delete-task");

const app = createOpenAPIHono();

app.use(requirePermission({ task: ["delete"] })); // Permission checking
const deletedTask = app.openapi(deletedTaskRoute, async (c) => {
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
});

export default deletedTask;
