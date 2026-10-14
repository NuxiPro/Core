import { db } from "@backend/src/drizzle/connection";
import { WorkspacesTable } from "@backend/src/drizzle/schemas";
import { createOpenAPIHono } from "@backend/src/lib/openapi";
import { createLogger } from "@backend/src/logique/logging/logger";
import { uuid } from "@backend/utils/uuid";
import { requirePermission } from "@backend/src/lib/auth-middleware";
import { createWorkspaceRoute } from "../workspace.router";

const log = createLogger("workspace/create");


const app = createOpenAPIHono();
app.use(requirePermission({ workspace: ["create"] }));
app.openapi(createWorkspaceRoute, async (c) => {
  const user = c.get("user");
  try {
    const data = c.req.valid("json");

    const [newWorkspace] = await db
      .insert(WorkspacesTable)
      .values({
        id: uuid(),
        name: data.name,
        userId: user.id,
        createdAt: new Date(),
      })
      .returning();

    return c.json(newWorkspace, 201);
  } catch (err) {
    log.error("Failed to create workspace", err);
    return c.json({ message: "Internal server error" }, 500);
  }
});

export default app;
