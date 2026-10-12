import type { ArchivedTask } from "@packages/shared/types/task/task";
import { handleResponse } from "@/src/shared/api/handleResponse";

export async function getArchivedTasks(projectId: string): Promise<ArchivedTask[]> {
  const response = await fetch(`/api/projects/${projectId}/archives`);
  return handleResponse<ArchivedTask[]>(response, "Erreur chargement archives", "archive/list");
}

export async function restoreTask(taskId: string): Promise<void> {
  const response = await fetch(`/api/tasks/${taskId}/restore`, { method: "POST" });
  return handleResponse<void>(response, "Erreur restauration tâche", "archive/restore");
}
