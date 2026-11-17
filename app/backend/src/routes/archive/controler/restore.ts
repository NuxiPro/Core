import { getColumnId } from "@backend/src/config";
import { db } from "@backend/src/drizzle/connection";
import {
  archivedCardsTable,
  cardsTable,
} from "@backend/src/drizzle/schemas/workspace";
import type { AppEnv } from "@backend/src/types/app-env";
import type { RouteHandler } from "@hono/zod-openapi";
import { createLogger } from "@packages/shared/utils/logger";
import { and, desc, eq } from "drizzle-orm";
import { generateKeyBetween } from "fractional-indexing";
import type { restoreArchiveRoute } from "../archive.router";

const log = createLogger("archive/restore");

export const restoreArchiveHandler: RouteHandler<
  typeof restoreArchiveRoute,
  AppEnv
> = async (c) => {
  const user = c.get("user");
  const { id } = c.req.valid("param");

  try {
    const restored = await db.transaction(async (tx) => {
      const [row] = await tx
        .select()
        .from(archivedCardsTable)
        .where(
          and(
            eq(archivedCardsTable.id, id),
            eq(archivedCardsTable.userId, user.id),
          ),
        );
      if (!row) return false;

      // Restores always land at the end of the To Do column: read its
      // last position, then append (same approach as task creation,
      // no unique conflict).
      const [last] = await tx
        .select({ positionString: cardsTable.positionString })
        .from(cardsTable)
        .where(
          and(
            eq(cardsTable.userId, user.id),
            eq(cardsTable.projectId, row.projectId),
            eq(cardsTable.quadrant, getColumnId("todo")),
          ),
        )
        .orderBy(desc(cardsTable.positionString))
        .limit(1);

      await tx.insert(cardsTable).values({
        id: row.taskId,
        userId: user.id,
        projectId: row.projectId,
        title: row.title,
        description: row.description,
        quadrant: getColumnId("todo"),
        priorityLabel: row.priorityLabel,
        positionString: generateKeyBetween(last?.positionString ?? null, null),
        dueDate: row.dueDate,
        createdAt: row.createdAt,
        updatedAt: new Date(),
      });

      await tx
        .delete(archivedCardsTable)
        .where(eq(archivedCardsTable.id, row.id));
      return true;
    });

    if (!restored) {
      log.warn("[PATCH /restoreArchive] Archived task not found", { id });
      return c.json({ message: "Archived task not found" }, 404);
    }

    return c.json({ success: true }, 200);
  } catch (err) {
    log.error("[PATCH /restoreArchive] DB error", {
      id,
      error: err instanceof Error ? err.message : String(err),
    });
    return c.json({ message: "Internal server error" }, 500);
  }
};
