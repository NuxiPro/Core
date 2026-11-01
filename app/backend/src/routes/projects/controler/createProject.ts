import { db } from "@backend/src/drizzle/connection";
import { projectsTable, WorkspacesTable } from "@backend/src/drizzle/schemas";
import { createLogger } from "@backend/src/logique/logging/logger";
import { uuid } from "@backend/utils/uuid";
import { createSlug } from "@packages/shared/utils/slug";
import { and, eq } from "drizzle-orm";
import { createProjetRoute } from "../projects.router";
import type { RouteHandler } from "@hono/zod-openapi";
import type { AppEnv } from "@backend/src/types/app-env";

const log = createLogger("projects/newProjects");

/**
 * Handler du contrôleur — pattern kaneo : le contrôleur exporte une fonction,
 * l'instance est créée une seule fois par le module (projects/index.ts).
 */
export const createProjectHandler: RouteHandler<typeof createProjetRoute, AppEnv> = async (c) => {
  const user = c.get("user");
  try {
    const data = c.req.valid("json");
    const result = await db.transaction(async (tx) => {
      const [workspace] = await tx
        .select()
        .from(WorkspacesTable)
        .where(
          and(
            eq(WorkspacesTable.id, data.workspaceId),
            eq(WorkspacesTable.userId, user.id),
          ),
        );

      if (!workspace) {
        return null;
      }

      const existing = await tx
        .select({ slug: projectsTable.slug })
        .from(projectsTable)
        .where(eq(projectsTable.userId, user.id));
      const slug = createSlug(data.name, existing.map((r) => r.slug));

      const [newProject] = await tx
        .insert(projectsTable)
        .values({
          id: uuid(),
          name: data.name,
          description: data.description,
          workspaceId: data.workspaceId,
          slug,
          userId: user.id,
        })
        .returning();

      return newProject;
    });

    if (result === null) {
      return c.json({ message: "Workspace not found" }, 404);
    }

    return c.json(result, 201);
  } catch (err) {
    log.error("Failed to create project", err);
    return c.json({ message: "Internal server error" }, 500);
  }
};
