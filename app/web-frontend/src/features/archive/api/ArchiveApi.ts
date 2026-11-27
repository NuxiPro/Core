import type { PriorityLabel } from "@packages/shared/types/task/priority-level";
import type {
  ArchivedTask,
  ArchivedTaskSummary,
} from "@packages/shared/types/task/task";
import { handleResponse } from "@/src/shared/api/handleResponse";
import { client } from "@/src/shared/lib/client";

// Step 1: light list of a project's archives (id, title, dates only).
// The heavy description comes with the detail, on click.
export async function getArchivedTasks(
  projectId: string,
): Promise<ArchivedTaskSummary[]> {
  const response = await client.api.v1.archive.getArchives.$get({
    query: { projectId },
  });
  return handleResponse<ArchivedTaskSummary[]>(
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

// Full detail of one archived task (step 2, on click). The board getTask
// endpoint only reads `cards` — an archived row is no longer there.
export async function getArchivedTask(id: string): Promise<ArchivedTask> {
  const response = await client.api.v1.archive.getArchive[":id"].$get({
    param: { id },
  });
  return handleResponse<ArchivedTask>(
    response,
    "Tâche archivée introuvable",
    "archive/detail",
  );
}

// Edit an archived task in place (the row stays in archived_cards).
export async function updateArchivedTask(
  id: string,
  updates: {
    title?: string;
    description?: string;
    priority?: PriorityLabel;
    dueDate?: string | null;
  },
): Promise<ArchivedTask> {
  const response = await client.api.v1.archive.updateArchive[":id"].$patch({
    param: { id },
    json: updates,
  });
  return handleResponse<ArchivedTask>(
    response,
    "Impossible d'enregistrer la tâche",
    "archive/update",
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

// Permanently delete one archived task (dedicated endpoint, no trash).
export async function deleteArchivedTask(archiveId: string): Promise<void> {
  const response = await client.api.v1.archive.deletedArchive[":id"].$delete({
    param: { id: archiveId },
  });
  await handleResponse<{ success: boolean }>(
    response,
    "Impossible de supprimer la tâche",
    "archive/delete",
  );
}
