import { db } from "@backend/src/drizzle/connection";
import { projectsTable } from "@backend/src/drizzle/schemas";
import { createOpenAPIHono } from "@backend/src/lib/openapi";
import { createLogger } from "@backend/src/logique/logging/logger";
import { and, eq } from "drizzle-orm";
import { DeletedProjectRoute } from "../projects.router";
import { requirePermission } from "@backend/src/lib/auth-middleware";

const log = createLogger("Project/deleted-project");

const app = createOpenAPIHono();
app.use(requirePermission({ project: ["delete"] }));
app.openapi(DeletedProjectRoute, async (c) => {
  const user = c.get("user");
  try {
    const { id } = c.req.valid("param");

    const deleted = await db
      .delete(projectsTable)
      .where(and(eq(projectsTable.id, id), eq(projectsTable.userId, user.id)))
      .returning({ id: projectsTable.id });

    if (deleted.length === 0) {
      return c.json(
        { message: "Project not found" },
        404,
      );
    }
    return c.json({ success: true }, 200);
  } catch (err) {
    log.error(
      "[DELETE /deletedProject] Failed to delete project",
      err,
    );
    return c.json({ message: "Internal server error" }, 500);
  }
});

export default app;
