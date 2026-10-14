import { db } from "@backend/src/drizzle/connection";
import { WorkspacesTable } from "@backend/src/drizzle/schemas";
import { createOpenAPIHono } from "@backend/src/lib/openapi";
import { createLogger } from "@backend/src/logique/logging/logger";
import { getDbDateStr } from "@backend/utils/dateHelpers";
import { listWorkspacesRoute } from "../workspace.router";
import { requirePermission } from "@backend/src/lib/auth-middleware";
import { eq } from "drizzle-orm";

const log = createLogger("workspaces/list");

/**
 * GET /workspaces — loads only the workspace list for the sidebar.
 * Loads neither projects nor tasks.
 */

const app = createOpenAPIHono();
app.use(requirePermission({ workspace: ["read"] }));
app.openapi(listWorkspacesRoute, async (c) => {
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
        w.createdAt instanceof Date
          ? w.createdAt.toISOString()
          : getDbDateStr(),
    }));

    return c.json(result, 200);
  } catch (err) {
    log.error("Failed to load workspaces", err);
    return c.json({ message: "Internal server error" }, 500);
  }
});

export default app;
