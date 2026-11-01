import { db } from "@backend/src/drizzle/connection";
import { projectsTable } from "@backend/src/drizzle/schemas/workspace";
import { listProjectsRoute } from "../projects.router";


import { eq } from "drizzle-orm";
import type { RouteHandler } from "@hono/zod-openapi";
import type { AppEnv } from "@backend/src/types/app-env";
import { getDbDateStr } from "@backend/utils/dateHelpers";

import { createLogger } from "@backend/src/logique/logging/logger";

const log = createLogger("projects/list");
export const listProjectsHandler: RouteHandler<typeof listProjectsRoute, AppEnv> = async (c) => {
  const user = c.get("user");
  try {
    const rows = await db
      .select({
        id: projectsTable.id,
        name: projectsTable.name,
        slug: projectsTable.slug,
        description: projectsTable.description,
        createdAt: projectsTable.createdAt,
      })
      .from(projectsTable)
      .where(eq(projectsTable.userId, user.id));
    const result = rows.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : getDbDateStr(),
    }));
    return c.json(result, 200);
  } catch (err) {
    log.error("Failed to list projects", err);
    return c.json({ message: "Internal server error" }, 500);
  }
};
