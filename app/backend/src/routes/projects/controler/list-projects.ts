import { db } from "@backend/src/drizzle/connection";
import { projectsTable } from "@backend/src/drizzle/schemas";
import { createOpenAPIHono } from "@backend/src/lib/openapi";
import { createLogger } from "@backend/src/logique/logging/logger";
import { listProjectsRoute } from "../projects.router";
import { requirePermission } from "@backend/src/lib/auth-middleware";
import { eq } from "drizzle-orm";

const log = createLogger("projects/list");

/**
 * GET /projects — loads only the project list for the sidebar.
 * Does not load tasks (see get-board.ts for a project + its tasks).
 */
const app = createOpenAPIHono();
app.use(requirePermission({ project: ["read"] }));
app.openapi(listProjectsRoute, async (c) => {
  const user = c.get("user");
  try {
    const projects = await db
      .select({
        id: projectsTable.id,
        name: projectsTable.name,
        slug: projectsTable.slug,
        description: projectsTable.description,
        createdAt: projectsTable.createdAt,
      })
      .from(projectsTable)
      .where(eq(projectsTable.userId, user.id))
      .orderBy(projectsTable.createdAt);

    const result = projects.map((p) => ({
      ...p,
      createdAt: p.createdAt.toISOString(),
    }));

    return c.json(result, 200);
  } catch (err) {
    log.error("Failed to load projects", err);
    return c.json({ message: "Internal server error" }, 500);
  }
});

export default app;
