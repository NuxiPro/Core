import { db } from "@backend/src/drizzle/connection";
import { WorkspacesTable } from "@backend/src/drizzle/schemas";
import { listWorkspacesRoute } from "../workspace.router";
import { createLogger } from "@backend/src/logique/logging/logger";
import { getDbDateStr } from "@backend/utils/dateHelpers";
import { eq } from "drizzle-orm";
import type { RouteHandler } from "@hono/zod-openapi";
import type { AppEnv } from "@backend/src/types/app-env";

const log = createLogger("workspaces/list");

export const listWorkspacesHandler: RouteHandler<typeof listWorkspacesRoute, AppEnv> = async (c) => {
  const user = c.get("user");
  try {
    const workspaces = await db
      .select({
        id: WorkspacesTable.id,
        name: WorkspacesTable.name,
        createdAt: WorkspacesTable.createdAt,
      })
      .from(WorkspacesTable)
      .where(eq(WorkspacesTable.userId, user.id))
      .orderBy(WorkspacesTable.createdAt);
    const result = workspaces.map((w) => ({
      ...w,
      createdAt:
        w.createdAt instanceof Date ? w.createdAt.toISOString() : getDbDateStr(),
    }));
    return c.json(result, 200);
  } catch (err) {
    log.error("Failed to load workspaces", err);
    return c.json({ message: "Internal server error" }, 500);
  }
};
