import { db } from "@backend/src/drizzle/connection";
import { projectsTable } from "@backend/src/drizzle/schemas/workspace";
import { createLogger } from "@backend/src/logique/logging/logger";
import type { AppEnv } from "@backend/src/types/app-env";
import type { RouteHandler } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";
import type { listProjectsRoute } from "../projects.router";

const log = createLogger("projects/list");
export const listProjectsHandler: RouteHandler<
  typeof listProjectsRoute,
  AppEnv
> = async (c) => {
  const user = c.get("user");
  try {
    const rows = await db
      .select({
        id: projectsTable.id,
        name: projectsTable.name,
        slug: projectsTable.slug,
        description: projectsTable.description,
        createdAt: projectsTable.createdAt,
        workspaceId: projectsTable.workspaceId,
      })
      .from(projectsTable)
      .where(eq(projectsTable.userId, user.id));
    const result = rows.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      createdAt: p.createdAt.toISOString(),
      workspaceId: p.workspaceId,
    }));
    return c.json(result, 200);
  } catch (err) {
    log.error("Failed to list projects", err);
    return c.json({ message: "Internal server error" }, 500);
  }
};
