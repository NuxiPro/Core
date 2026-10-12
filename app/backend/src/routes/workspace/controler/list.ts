import { db } from "@backend/src/drizzle/connection";
import { WorkspacesTable } from "@backend/src/drizzle/schemas";
import { createOpenAPIHono } from "@backend/src/lib/openapi";
import { createLogger } from "@backend/src/logique/logging/logger";
import { getDbDateStr } from "@backend/utils/dateHelpers";
import { listWorkspacesRoute } from "../workspace.router";
import { eq } from "drizzle-orm";

const log = createLogger("workspaces/list");

const app = createOpenAPIHono().openapi(listWorkspacesRoute, async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ message: "Non authentifié" }, 401);
  }

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
    log.error("Erreur lors du chargement des workspaces", err);
    return c.json({ message: "Erreur interne du serveur" }, 500);
  }
});

export default app;
