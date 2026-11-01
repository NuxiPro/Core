import { db } from "@backend/src/drizzle/connection";
import { WorkspacesTable } from "@backend/src/drizzle/schemas";
import { createWorkspaceRoute } from "../workspace.router";
import { createLogger } from "@backend/src/logique/logging/logger";
import { uuid } from "@backend/utils/uuid";
import type { RouteHandler } from "@hono/zod-openapi";
import type { AppEnv } from "@backend/src/types/app-env";

const log = createLogger("workspace/create");

export const createWorkspaceHandler: RouteHandler<typeof createWorkspaceRoute, AppEnv> = async (c) => {
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
};
