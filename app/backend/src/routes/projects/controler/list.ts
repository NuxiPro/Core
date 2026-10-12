import { db } from "@backend/src/drizzle/connection";
import { projectsTable } from "@backend/src/drizzle/schemas";
import { createOpenAPIHono } from "@backend/src/lib/openapi";
import { createLogger } from "@backend/src/logique/logging/logger";
import { listProjectsRoute } from "../projects.router";
import { eq } from "drizzle-orm";

const log = createLogger("projects/list");

const app = createOpenAPIHono().openapi(listProjectsRoute, async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ message: "Non authentifié" }, 401);
  }

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
    log.error("Erreur lors du chargement des projets", err);
    return c.json({ message: "Erreur interne du serveur" }, 500);
  }
});

export default app;
