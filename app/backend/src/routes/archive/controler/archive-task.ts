import { archiveCard } from "@backend/src/logique/archive/archive-card";
import type { AppEnv } from "@backend/src/types/app-env";
import type { RouteHandler } from "@hono/zod-openapi";
import { createLogger } from "@packages/shared/utils/logger";
import type { archiveTaskRoute } from "../archive.router";
import { serializeArchived } from "./serialize";

const log = createLogger("archive/create");

export const archiveTaskHandler: RouteHandler<
  typeof archiveTaskRoute,
  AppEnv
> = async (c) => {
  const user = c.get("user");
  const { projectId } = c.req.valid("param");
  const { taskId } = c.req.valid("json");

  try {
    const archived = await archiveCard(taskId, user.id, projectId);

    if (!archived) {
      log.warn("[POST /newArchive] Card not found", { projectId, taskId });
      return c.json({ message: "Task not found" }, 404);
    }

    return c.json(serializeArchived(archived), 201);
  } catch (err) {
    log.error("[POST /newArchive] DB error", {
      projectId,
      taskId,
      error: err instanceof Error ? err.message : String(err),
    });
    return c.json({ message: "Internal server error" }, 500);
  }
};
