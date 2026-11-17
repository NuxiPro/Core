import type { ArchivedTask } from "@packages/shared/types/task/task";
import { handleResponse } from "@/src/shared/api/handleResponse";
import { client } from "@/src/shared/lib/client";

// List archived tasks of a project, newest first.
export async function getArchivedTasks(
  projectId: string,
): Promise<ArchivedTask[]> {
  const response = await client.api.v1.archive.getArchives.$get({
    query: { projectId },
  });
  return handleResponse<ArchivedTask[]>(
    response,
    "Erreur chargement archives",
    "archive/list",
  );
}

// Archive a task: moves it from the board to the archive (transactional).
export async function archiveTask(
  projectId: string,
  taskId: string,
): Promise<ArchivedTask> {
  const response = await client.api.v1.archive[":projectId"].newArchive.$post({
    param: { projectId },
    json: { taskId },
  });
  return handleResponse<ArchivedTask>(
    response,
    "Impossible d'archiver la tâche",
    "archive/create",
  );
}

// Restore an archived task back onto the board (end of its original column).
export async function restoreTask(archiveId: string): Promise<void> {
  const response = await client.api.v1.archive.restoreArchive[":id"].$patch({
    param: { id: archiveId },
  });
  await handleResponse<{ success: boolean }>(
    response,
    "Erreur restauration tâche",
    "archive/restore",
  );
}
