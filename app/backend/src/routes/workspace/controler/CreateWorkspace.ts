import { db } from "@backend/src/drizzle/connection";
import { WorkspacesTable } from "@backend/src/drizzle/schemas";
import { createOpenAPIHono } from "@backend/src/lib/openapi";
import { createLogger } from "@backend/src/logique/logging/logger";
import { uuid } from "@backend/utils/uuid";
import { createWorkspaceRoute } from "../workspace.router";

const log = createLogger("workspace/create");


const app = createOpenAPIHono().openapi(createWorkspaceRoute, async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ message: "Non authentifié" }, 401);
  }

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
    log.error("Impossible de créer un nouveau workspace", err);
    return c.json({ message: "Erreur interne du serveur" }, 500);
  }
});

export default app;
