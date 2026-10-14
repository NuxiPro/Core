import { db } from "@backend/src/drizzle/connection";
import { WorkspacesTable } from "@backend/src/drizzle/schemas";
import { createOpenAPIHono } from "@backend/src/lib/openapi";
import { createLogger } from "@backend/src/logique/logging/logger";
import { getDbDateStr } from "@backend/utils/dateHelpers";
import { getWorkspaceRoute } from "../workspace.router";
import { requirePermission } from "@backend/src/lib/auth-middleware";
import { and, eq } from "drizzle-orm";

const log = createLogger("workspaces/get");

const app = createOpenAPIHono();
app.use(requirePermission({ workspace: ["read"] }));
app.openapi(getWorkspaceRoute, async (c) => {
  const user = c.get("user");
  const { id } = c.req.valid("param");

  try {
    const [workspace] = await db
      .select({
        id: WorkspacesTable.id,
        name: WorkspacesTable.name,
        createdAt: WorkspacesTable.createdAt,
      })
      .from(WorkspacesTable)
      .where(
        and(eq(WorkspacesTable.id, id), eq(WorkspacesTable.userId, user.id)),
      )
      .limit(1);

    if (!workspace) {
      return c.json({ message: "Workspace not found" }, 404);
    }

    return c.json(
      {
        id: workspace.id,
        name: workspace.name,
        createdAt:
          workspace.createdAt instanceof Date
            ? workspace.createdAt.toISOString()
            : getDbDateStr(),
      },
      200,
    );
  } catch (err) {
    log.error("Failed to load workspace", err);
    return c.json({ message: "Internal server error" }, 500);
  }
});

export default app;
