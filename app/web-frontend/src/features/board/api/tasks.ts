import { COLUMN_IDS } from "@packages/shared/config/index-frontend";
import type { ColumnId } from "@packages/shared/config/index";
import type { Task, TaskSummary } from "@packages/shared/types/task/task";
import { handleResponse } from "@/src/shared/api/handleResponse";
import { createLogger } from "@/src/shared/api/logger";
import { client } from "@/src/shared/lib/client";

const log = createLogger("board/moveTask");
const UUID_V7_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function getBoard(projectId: string): Promise<{
  id: string;
  name: string;
  prefix: string;
  description: string | null;
  createdAt: string;
  tasks: TaskSummary[];
}> {
  const response = await client.api.v1.projects[":projectId"].board.$get({
    param: { projectId },
  });
  return await handleResponse(
    response,
    "Impossible de charger le projet",
    "projects/get-board",
  );
}

export async function getTaskById(id: string): Promise<Task> {
  const response = await client.api.v1.kanban.getTask[":id"].$get({
    param: { id },
  });
  return await handleResponse(
    response,
    "Tâche non trouvée",
    "kanban/get-task-by-id",
  );
}

export async function createTask(data: {
  title: string;
  colId: ColumnId;
  projectId: string;
}): Promise<Task> {
  const { projectId, ...body } = data;
  const response = await client.api.v1.kanban[":projectId"].newTask.$post({
    param: { projectId },
    json: body,
  });
  return await handleResponse(
    response,
    "Impossible de créer la tâche",
    "kanban/create-task",
  );
}

export async function updateTask(
  taskId: string,
  updates: Partial<Task>,
): Promise<Task> {
  const response = await client.api.v1.kanban.updateTask[":id"].$patch({
    param: { id: taskId },
    json: updates,
  });
  const body = await handleResponse<{ success: boolean; data: Task }>(
    response,
    "Impossible de mettre à jour la tâche",
    "kanban/update-task",
  );
  return body.data;
}

export async function deleteTask(taskId: Task["id"]): Promise<void> {
  const response = await client.api.v1.kanban.deletedTask[":id"].$delete({
    param: { id: taskId },
  });
  await handleResponse(
    response,
    "Impossible de supprimer la tâche",
    "kanban/delete-task",
  );
}

export async function moveTask(
  taskId: Task["id"],
  options: {
    colId: ColumnId;
    overTaskId: string | null;
    insertBefore: boolean;
    signal?: AbortSignal;
  },
): Promise<{ success: boolean; newPosition: string }> {
  const { signal, ...rest } = options;
  // Validation client — bloque le payload malveillant avant le réseau
  if (!(COLUMN_IDS as readonly string[]).includes(rest.colId)) {
    throw new Error("colId invalide");
  }
  if (rest.overTaskId !== null && !UUID_V7_RE.test(rest.overTaskId)) {
    throw new Error("overTaskId invalide");
  }
  // le client propose, le serveur valide et calcule
  const json = {
    colId: rest.colId,
    overTaskId: rest.overTaskId,
    insertBefore: rest.insertBefore,
  };

  log.debug("→ PATCH", { taskId, json });

  const response = await client.api.v1.kanban.updateTaskPosition[":id"].$patch(
    { param: { id: taskId }, json },
    signal ? { init: { signal } } : {},
  );

  log.debug("← response", { status: response.status, ok: response.ok });

  const body = await handleResponse<{ success: boolean; newPosition: string }>(
    response,
    "Impossible de déplacer la tâche",
    "kanban/move-task",
  );

  log.debug("success", body);

  return { success: body.success, newPosition: body.newPosition };
}
