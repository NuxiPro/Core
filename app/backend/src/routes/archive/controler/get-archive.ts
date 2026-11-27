import { db } from "@backend/src/drizzle/connection";
import { archivedCardsTable } from "@backend/src/drizzle/schemas/workspace";
import type { AppEnv } from "@backend/src/types/app-env";
import type { RouteHandler } from "@hono/zod-openapi";
import { createLogger } from "@backend/src/logique/logging/logger";
import { and, eq } from "drizzle-orm";
import type { getArchiveRoute } from "../archive.router";
import { serializeArchived } from "./serialize";

const log = createLogger("archive/detail");

export const getArchiveHandler: RouteHandler<
  typeof getArchiveRoute,
  AppEnv
> = async (c) => {
  const user = c.get("user");
  const { id } = c.req.valid("param");

  try {
    // The userId filter doubles as the ownership check: someone else's
    // archive row simply returns 404 (no data leak).
    const [row] = await db
      .select()
      .from(archivedCardsTable)
      .where(
        and(
          eq(archivedCardsTable.id, id),
          eq(archivedCardsTable.userId, user.id),
        ),
      )
      .limit(1);

    if (!row) {
      log.warn("[GET /getArchive] Archived task not found", { id });
      return c.json({ message: "Archived task not found" }, 404);
    }

    return c.json(serializeArchived(row), 200);
  } catch (err) {
    log.error("[GET /getArchive] DB error", {
      id,
      error: err instanceof Error ? err.message : String(err),
    });
    return c.json({ message: "Internal server error" }, 500);
  }
};
