import { db } from "@backend/src/drizzle/connection";
import {
  archivedCardsTable,
  cardsTable,
} from "@backend/src/drizzle/schemas/workspace";
import type { AppEnv } from "@backend/src/types/app-env";
import { uuid } from "@backend/utils/uuid";
import type { RouteHandler } from "@hono/zod-openapi";
import { createLogger } from "@packages/shared/utils/logger";
import { and, eq } from "drizzle-orm";
import type { archiveTaskRoute } from "../archive.router";
import { serializeArchived } from "./serialize";

const log = createLogger("archive/create");

export const archiveTaskHandler: RouteHandler<
  typeof archiveTaskRoute,
  AppEnv
> = async (c) => {
  const user = c.get("user");
  const { projectId } = c.req.valid("param");
  const { taskId } = c.req.valid("json");

  try {
    const archived = await db.transaction(async (tx) => {
      // The card must exist, belong to the user and to this project.
      const [card] = await tx
        .select()
        .from(cardsTable)
        .where(
          and(
            eq(cardsTable.id, taskId),
            eq(cardsTable.userId, user.id),
            eq(cardsTable.projectId, projectId),
          ),
        );
      if (!card) return null;

      // Move: insert into the archive, then remove the card — inside the
      // same transaction, so either both happen or nothing does
      // (spec requirement: no data loss).
      const [row] = await tx
        .insert(archivedCardsTable)
        .values({
          id: uuid(),
          taskId: card.id,
          userId: user.id,
          projectId: card.projectId,
          title: card.title,
          description: card.description,
          quadrant: card.quadrant,
          priorityLabel: card.priorityLabel,
          dueDate: card.dueDate,
          createdAt: card.createdAt,
          archivedAt: new Date(),
        })
        .returning();

      await tx.delete(cardsTable).where(eq(cardsTable.id, card.id));
      return row;
    });

    if (!archived) {
      log.warn("[POST /newArchive] Card not found", { projectId, taskId });
      return c.json({ message: "Task not found" }, 404);
    }

    return c.json(serializeArchived(archived), 201);
  } catch (err) {
    log.error("[POST /newArchive] DB error", {
      projectId,
      taskId,
      error: err instanceof Error ? err.message : String(err),
    });
    return c.json({ message: "Internal server error" }, 500);
  }
};
