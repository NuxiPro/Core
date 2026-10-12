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
  // Vérification de l'authentification
  const user = c.get("user");
  if (!user) {
    return c.json({ message: "Non authentifié" }, 401);
  }

  try {
    const { id } = c.req.valid("param");

    const deleted = await db
      .delete(cardsTable)
      .where(and(eq(cardsTable.id, id), eq(cardsTable.userId, user.id)))
      .returning({ id: cardsTable.id });

    if (!deleted) {
      log.error("[deleted-task] Task not found", { taskId: id })
      return c.json({ message: "Task not found"}, 404)
    }

    return c.json({ success: true }, 200);
  } catch (err) {
    log.error("[DELETE /deletedTask] erreur DB", err);
    return c.json({ message: "Erreur serveur" }, 500);
  }
});

export default deletedTask;
