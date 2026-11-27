import { db } from "@backend/src/drizzle/connection";
import { archivedCardsTable } from "@backend/src/drizzle/schemas/workspace";
import type { AppEnv } from "@backend/src/types/app-env";
import type { RouteHandler } from "@hono/zod-openapi";
import { createLogger } from "@backend/src/logique/logging/logger";
import { and, eq } from "drizzle-orm";
import type { deleteArchiveRoute } from "../archive.router";

const log = createLogger("archive/delete");

export const deleteArchiveHandler: RouteHandler<
  typeof deleteArchiveRoute,
  AppEnv
> = async (c) => {
  const user = c.get("user");
  const { id } = c.req.valid("param");

  try {
    // Single statement: atomic by itself, userId keeps the ownership check.
    const deleted = await db
      .delete(archivedCardsTable)
      .where(
        and(
          eq(archivedCardsTable.id, id),
          eq(archivedCardsTable.userId, user.id),
        ),
      )
      .returning({ id: archivedCardsTable.id });

    if (deleted.length === 0) {
      return c.json({ message: "Archived task not found" }, 404);
    }

    return c.json({ success: true }, 200);
  } catch (err) {
    log.error("[DELETE /deletedArchive] DB error", {
      id,
      error: err instanceof Error ? err.message : String(err),
    });
    return c.json({ message: "Internal server error" }, 500);
  }
};
