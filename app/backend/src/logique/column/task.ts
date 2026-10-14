import type { CreateTaskInput } from "@backend/src/routes/kanban/task.shemas";
import { getDbDateStr } from "@backend/utils/dateHelpers";
import { uuid } from "@backend/utils/uuid";
import type { z } from "@hono/zod-openapi";
import type { Task } from "@packages/shared/types/task/task";
import { generateKeyBetween } from "fractional-indexing";

/**
 * Builds a Task object ready for database insertion.
 * Position is computed via fractional indexing between the two neighbors.
 *
 * @param input        - Task data (title, description, colId)
 * @param prevPosition - Position of the neighbor above (null = very top)
 * @param nextPosition - Position of the neighbor below (null = very bottom)
 * @throws "INVALID_POSITION" if neighbor positions are inconsistent
 */
export function buildTask(
  input: z.infer<typeof CreateTaskInput>,
  prevPosition: string | null = null,
  nextPosition: string | null = null,
): Omit<Task, "userId"> {
  const now = getDbDateStr();

  let positionString: string;
  try {
    positionString = generateKeyBetween(prevPosition, nextPosition);
  } catch {
    throw new Error("INVALID_POSITION");
  }

  return {
    id: uuid(),
    ...input,
    positionString,
    createdAt: now,
  };
}
