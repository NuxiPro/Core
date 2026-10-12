import type { CreateTaskInput } from "@backend/src/routes/kanban/task.shemas";
import { getDbDateStr } from "@backend/utils/dateHelpers";
import { uuid } from "@backend/utils/uuid";
import type { z } from "@hono/zod-openapi";
import type { Task } from "@packages/shared/types/task/task";
import { generateKeyBetween } from "fractional-indexing";

/**
 * Construit un objet Task prêt à être inséré en base.
 * La position est calculée par fractional indexing entre les deux voisins.
 *
 * @param input        - Données de la tâche (title, description, colId)
 * @param prevPosition - Position du voisin du dessus (null = tout en haut)
 * @param nextPosition - Position du voisin du dessous (null = tout en bas)
 * @throws "INVALID_POSITION" si les positions voisines sont incohérentes
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
