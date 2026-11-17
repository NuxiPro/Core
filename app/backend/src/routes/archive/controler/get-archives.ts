import { db } from "@backend/src/drizzle/connection";
import { archivedCardsTable } from "@backend/src/drizzle/schemas/workspace";
import type { AppEnv } from "@backend/src/types/app-env";
import type { RouteHandler } from "@hono/zod-openapi";
import { createLogger } from "@packages/shared/utils/logger";
import { and, desc, eq } from "drizzle-orm";
import type { getArchivesRoute } from "../archive.router";
import { serializeArchived } from "./serialize";

const log = createLogger("archive/list");

export const getArchivesHandler: RouteHandler<
  typeof getArchivesRoute,
  AppEnv
> = async (c) => {
  const user = c.get("user");
  const { projectId } = c.req.valid("query");

  try {
    // The userId filter doubles as the ownership check: another user's
    // project simply returns an empty list (no data leak).
    // Single indexed query on (projectId, archivedAt), newest first.
    const rows = await db
      .select()
      .from(archivedCardsTable)
      .where(
        and(
          eq(archivedCardsTable.userId, user.id),
          eq(archivedCardsTable.projectId, projectId),
        ),
      )
      .orderBy(desc(archivedCardsTable.archivedAt));

    return c.json(rows.map(serializeArchived), 200);
  } catch (err) {
    log.error("[GET /getArchives] DB error", {
      projectId,
      error: err instanceof Error ? err.message : String(err),
    });
    return c.json({ message: "Internal server error" }, 500);
  }
};
