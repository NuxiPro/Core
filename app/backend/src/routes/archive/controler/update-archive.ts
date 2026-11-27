import { db } from "@backend/src/drizzle/connection";
import { archivedCardsTable } from "@backend/src/drizzle/schemas/workspace";
import type { AppEnv } from "@backend/src/types/app-env";
import type { RouteHandler } from "@hono/zod-openapi";
import { createLogger } from "@backend/src/logique/logging/logger";
import { and, eq } from "drizzle-orm";
import type { updateArchiveRoute } from "../archive.router";
import { serializeArchived } from "./serialize";

const log = createLogger("archive/update");

export const updateArchiveHandler: RouteHandler<
  typeof updateArchiveRoute,
  AppEnv
> = async (c) => {
  const user = c.get("user");
  const { id } = c.req.valid("param");
  const body = c.req.valid("json");

  try {
    // Nothing to update. An empty body would build an empty SQL UPDATE,
    // which crashes the query. Same contract as the board updateTask.
    if (Object.keys(body).length === 0) {
      return c.json({ message: "No changes provided" }, 400);
    }

    // The body and the table don't use the same names and types, so we
    // rebuild the payload field by field:
    // - a field missing from the body stays missing here → the database
    //   column is left untouched (partial update, no accidental erase);
    // - title and description have the same name on both sides → copied
    //   as-is by the destructuring below;
    // - priority and dueDate need a translation (see the ifs).
    const { priority, dueDate, ...direct } = body;
    const payload: Record<string, unknown> = { ...direct };

    // The API calls it "priority", the table column is "priority_label".
    if (priority !== undefined) {
      payload.priorityLabel = priority;
    }

    // JSON has no Date type: the ISO string must become a Date for
    // Postgres. null clears the deadline.
    if (dueDate !== undefined) {
      payload.dueDate = dueDate === null ? null : new Date(dueDate);
    }

    // UPDATE + RETURNING in a single query. The userId filter is the
    // ownership check: someone else's row returns 404 (no data leak).
    const [updated] = await db
      .update(archivedCardsTable)
      .set(payload)
      .where(
        and(
          eq(archivedCardsTable.id, id),
          eq(archivedCardsTable.userId, user.id),
        ),
      )
      .returning();

    if (!updated) {
      log.warn("[update-archive] Archived task not found", {
        id,
        userId: user.id,
      });
      return c.json({ message: "Archived task not found" }, 404);
    }

    return c.json(serializeArchived(updated), 200);
  } catch (err) {
    log.error("[update-archive] DB error", {
      id,
      error: err instanceof Error ? err.message : String(err),
    });
    return c.json({ message: "Internal server error" }, 500);
  }
};
