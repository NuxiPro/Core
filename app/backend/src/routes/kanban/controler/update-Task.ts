import { getColIdFromSqlId } from "@backend/src/config";
import { db } from "@backend/src/drizzle/connection/index";
import { cardsTable } from "@backend/src/drizzle/schemas/workspace";
import { createOpenAPIHono } from "@backend/src/lib/openapi";
import { and, eq } from "drizzle-orm";
import { z } from "@hono/zod-openapi";
import { createLogger } from "@packages/shared/utils/logger";
import { UpdateTaskBody } from "../task.shemas";
import { updateTaskRoute } from "../task.router";
import { requirePermission } from "@backend/src/lib/auth-middleware";

const log = createLogger("kanban/update-task");

export type UpdateTaskBodyType = z.infer<typeof UpdateTaskBody>;

const app = createOpenAPIHono();

app.use(requirePermission({ task : ["update"] }))
app.openapi(updateTaskRoute, async (c) => {
  const user = c.get("user");

  try {
    const { id } = c.req.valid("param");
    const updates = c.req.valid("json") as UpdateTaskBodyType;

    // Sécurité : si le body est vide, on ne fait rien
    if (Object.keys(updates).length === 0) {
      return c.json({ message: "Aucune modification fournie" }, 400);
    }

    const { priority, ...rest } = updates;
    const dbPayload: Record<string, unknown> = {
      ...rest,
      updatedAt: new Date(),
    };
    if (priority !== undefined) {
      dbPayload.priorityLabel = priority;
    }

    // UPDATE + RETURNING en une seule requête (au lieu de UPDATE séparé + SELECT)
    const rows = await db
      .update(cardsTable)
      .set(dbPayload)
      .where(and(eq(cardsTable.id, id), eq(cardsTable.userId, user.id)))
      .returning({
        id: cardsTable.id,
        title: cardsTable.title,
        description: cardsTable.description,
        quadrant: cardsTable.quadrant,
        priorityLabel: cardsTable.priorityLabel,
        positionString: cardsTable.positionString,
        createdAt: cardsTable.createdAt,
        updatedAt: cardsTable.updatedAt,
      });

    const updatedTask = rows[0];

    if (!updatedTask) {
      log.error("[update-task] Task not found", { taskId: id })
      return c.json({ message: "Task not found"}, 404)
    }

    return c.json(
      {
        success: true,
        data: {
          id: updatedTask.id,
          title: updatedTask.title,
          description: updatedTask.description ?? "",
          colId: getColIdFromSqlId(updatedTask.quadrant),
          priority: updatedTask.priorityLabel ?? "none",
          positionString: updatedTask.positionString,
          createdAt: updatedTask.createdAt.toISOString(),
          updatedAt: updatedTask.updatedAt.toISOString(),
        },
      },
      200,
    );
  } catch (err) {
    log.error("[PATCH /updateTask] erreur DB", err);
    return c.json({ message: "Erreur serveur" }, 500);
  }
});

export default app;
