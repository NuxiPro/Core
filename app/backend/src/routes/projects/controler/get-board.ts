import { db } from "@backend/src/drizzle/connection/index";
import { projectsTable } from "@backend/src/drizzle/schemas/workspace";
import { createOpenAPIHono } from "@backend/src/lib/openapi";
import { getTasksByProject } from "@backend/src/routes/kanban/controler/get-task";
import { getDbDateStr } from "@backend/utils/dateHelpers";
import { and, eq } from "drizzle-orm";
import { createLogger } from "../../../logique/logging/logger";
import { getBoardRoute } from "../projects.router";
import { requirePermission } from "@backend/src/lib/auth-middleware";

const log = createLogger("projects/get-board");

const app = createOpenAPIHono();
app.use(requirePermission({ project: ["read"] }));
app.openapi(getBoardRoute, async (c) => {
  const user = c.get("user");
  const { projectId } = c.req.valid("param");

  try {
    const [project] = await db
      .select()
      .from(projectsTable)
      .where(
        and(eq(projectsTable.id, projectId), eq(projectsTable.userId, user.id)),
      );

    if (!project) {
      return c.json({ message: "Project not found" }, 404);
    }

    const tasks = await getTasksByProject(projectId, user.id);

    return c.json(
      {
        id: project.id,
        name: project.name,
        slug: project.slug,
        description: project.description,
        createdAt:
          project.createdAt instanceof Date
            ? project.createdAt.toISOString()
            : getDbDateStr(),
        tasks,
      },
      200,
    );
  } catch (err) {
    log.error("[GET /projects/:projectId/board] DB error", {
      projectId,
      error: err,
    });
    return c.json({ message: "Internal server error" }, 500);
  }
});

export default app;
