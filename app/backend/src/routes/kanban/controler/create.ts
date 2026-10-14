import { getColumnId } from "@backend/src/config/index";
import { db } from "@backend/src/drizzle/connection/index";
import {
  cardsTable,
  projectsTable,
} from "@backend/src/drizzle/schemas/workspace";
import { requirePermission } from "@backend/src/lib/auth-middleware";
import { createOpenAPIHono } from "@backend/src/lib/openapi";
import { buildTask } from "@backend/src/logique/column/task";
import type { z } from "@hono/zod-openapi";
import { createLogger } from "@packages/shared/utils/logger";
import { and, desc, eq } from "drizzle-orm";
import { createTaskRoute } from "../task.router";
import type { CreateTaskInput } from "../task.shemas";

const log = createLogger("kanban/create");

const app = createOpenAPIHono();
app.use(requirePermission({ task: ["create"] }));

const createTaskApp = app.openapi(createTaskRoute, async (c) => {
  const user = c.get("user");
  const projectId = c.req.param("projectId");
  const data = c.req.valid("json") as z.infer<typeof CreateTaskInput>;

  try {
    // Retry on unique conflict: concurrent creates can read the same
    // last position and generate the same key. The loser re-reads the new
    // last position and retries with a fresh key. Bounded to 3 attempts.
    let task = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        // Atomic transaction: SELECT + INSERT to avoid position duplicates.
        task = await db.transaction(async (tx) => {
          // Check that the project belongs to the user.
          const [project] = await tx
            .select({ id: projectsTable.id })
            .from(projectsTable)
            .where(
              and(
                eq(projectsTable.id, projectId),
                eq(projectsTable.userId, user.id),
              ),
            );

          // Guard: project must exist and belong to the user.
          if (!project) {
            return null; // Null skips INSERT and triggers the 404 below.
          }

          const targetQuadrant = getColumnId(data.colId);
          const lastTask = await tx
            .select({ positionString: cardsTable.positionString })
            .from(cardsTable)
            .where(
              and(
                eq(cardsTable.userId, user.id),
                eq(cardsTable.projectId, project.id),
                eq(cardsTable.quadrant, targetQuadrant),
              ),
            )
            .orderBy(desc(cardsTable.positionString))
            .limit(1);

          const prevPosition = lastTask[0]?.positionString ?? null;
          const builtTask = buildTask(data, prevPosition, null);

          await tx.insert(cardsTable).values({
            id: builtTask.id,
            userId: user.id,
            projectId: project.id,
            title: builtTask.title,
            positionString: builtTask.positionString,
            quadrant: getColumnId(data.colId),
            createdAt: new Date(builtTask.createdAt),
            updatedAt: new Date(builtTask.createdAt),
          });
          return builtTask;
        });
        break; // Success, exit retry loop.
      } catch (err) {
        // Benign conflict under concurrency: retry with a fresh read.
        // Real errors or 3rd failure are rethrown to the 500 handler below.
        // Drizzle wraps the pg error, so match message text and error codes
        // at every nesting level.
        const seen: string[] = [];
        let cur: unknown = err;
        for (let depth = 0; depth < 4 && cur; depth++) {
          if (cur instanceof Error) seen.push(cur.message);
          const code = (cur as { code?: unknown })?.code;
          if (typeof code === "string") seen.push(code);
          cur = (cur as { cause?: unknown })?.cause;
        }
        const isConflict = /23505|duplicate key|unique constraint/i.test(
          seen.join(" | "),
        );
        if (!isConflict) throw err;
        if (attempt === 2) throw err;
      }
    }

    if (!task) {
      log.error("[create-task] Project not found", { projectId });
      return c.json({ message: "Project not found" }, 404);
    }

    return c.json(task, 201);
  } catch (err) {
    log.error("[POST /newTask] DB error", {
      projectId,
      error: err instanceof Error ? err.message : String(err),
    });
    return c.json({ message: "Internal server error" }, 500);
  }
});
export default createTaskApp;
