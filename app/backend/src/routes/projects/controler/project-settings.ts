import { db } from "@backend/src/drizzle/connection";
import { projectsTable } from "@backend/src/drizzle/schemas/workspace";
import type { AppEnv } from "@backend/src/types/app-env";
import type { RouteHandler } from "@hono/zod-openapi";
import { and, eq } from "drizzle-orm";
import { createLogger } from "@packages/shared/utils/logger";
import { getProjectRoute, updateProjectRoute } from "../projects.router";

const log = createLogger("projects/settings");

const toProjectResponse = (project: typeof projectsTable.$inferSelect) => ({
  id: project.id,
  name: project.name,
  description: project.description,
  slug: project.slug,
  createdAt: project.createdAt.toISOString(),
});

export const getProjectHandler: RouteHandler<
  typeof getProjectRoute,
  AppEnv
> = async (c) => {
  const user = c.get("user");
  const { projectId } = c.req.valid("param");

  try {
    const [project] = await db
      .select()
      .from(projectsTable)
      .where(and(eq(projectsTable.id, projectId), eq(projectsTable.userId, user.id)));

    if (!project) return c.json({ message: "Project not found" }, 404);
    return c.json(toProjectResponse(project), 200);
  } catch (error) {
    log.error("Failed to load project settings", error);
    return c.json({ message: "Internal server error" }, 500);
  }
};

export const updateProjectHandler: RouteHandler<
  typeof updateProjectRoute,
  AppEnv
> = async (c) => {
  const user = c.get("user");
  const { projectId } = c.req.valid("param");
  const input = c.req.valid("json");

  try {
    const [project] = await db
      .update(projectsTable)
      .set(input)
      .where(and(eq(projectsTable.id, projectId), eq(projectsTable.userId, user.id)))
      .returning();

    if (!project) return c.json({ message: "Project not found" }, 404);
    return c.json(toProjectResponse(project), 200);
  } catch (error) {
    log.error("Failed to update project settings", error);
    return c.json({ message: "Internal server error" }, 500);
  }
};
