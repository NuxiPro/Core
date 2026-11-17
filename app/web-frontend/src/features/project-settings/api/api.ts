import type { Project } from "@packages/shared/types/project/projects";
import { handleResponse } from "@/src/shared/api/handleResponse";
import { client } from "@/src/shared/lib/client";

export type UpdateProjectInput = {
  name: string;
  description: string | null;
};

export async function getProject(projectId: Project["id"]): Promise<Project> {
  const response = await client.api.v1.projects[":projectId"].$get({
    param: { projectId },
  });

  return handleResponse<Project>(
    response,
    "Impossible de charger le projet",
    "projects/settings/get",
  );
}

export async function updateProject(
  projectId: Project["id"],
  input: UpdateProjectInput,
): Promise<Project> {
  const response = await client.api.v1.projects[":projectId"].$patch({
    param: { projectId },
    json: input,
  });

  return handleResponse<Project>(
    response,
    "Impossible de mettre à jour le projet",
    "projects/settings/update",
  );
}

export async function deleteProject(projectId: Project["id"]): Promise<void> {
  const response = await client.api.v1.projects.deletedProject[":id"].$delete({
    param: { id: projectId },
  });

  await handleResponse<{ success: boolean }>(
    response,
    "Impossible de supprimer le projet",
    "projects/settings/delete",
  );
}
