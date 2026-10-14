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

    // Safety: if the body is empty, do nothing
    if (Object.keys(updates).length === 0) {
      return c.json({ message: "No changes provided" }, 400);
    }

    const { priority, dueDate, ...rest } = updates;
    const dbPayload: Record<string, unknown> = {
      ...rest,
      updatedAt: new Date(),
    };
    if (priority !== undefined) {
      dbPayload.priorityLabel = priority;
    }
    // ISO string → Date, null clears the deadline, undefined leaves it untouched.
    if (dueDate !== undefined) {
      dbPayload.dueDate = dueDate === null ? null : new Date(dueDate);
    }

    // UPDATE + RETURNING in a single query (instead of separate UPDATE + SELECT)
    const rows = await db
      .update(cardsTable)
      .set(dbPayload)
      .where(and(eq(cardsTable.id, id), eq(cardsTable.userId, user.id)))
      .returning({
        id: cardsTable.id,
        title: cardsTable.title,
        description: cardsTable.description,
        quadrant: cardsTable.quadrant,
        dueDate: cardsTable.dueDate,
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
          dueDate:
            updatedTask.dueDate instanceof Date
              ? updatedTask.dueDate.toISOString()
              : null,
          priority: updatedTask.priorityLabel ?? "none",
          positionString: updatedTask.positionString,
          createdAt: updatedTask.createdAt.toISOString(),
          updatedAt: updatedTask.updatedAt.toISOString(),
        },
      },
      200,
    );
  } catch (err) {
    log.error("[PATCH /updateTask] DB error", err);
    return c.json({ message: "Internal server error" }, 500);
  }
});

export default app;
