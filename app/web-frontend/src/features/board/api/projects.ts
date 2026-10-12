import type {
  CreateProjectInput,
  Project,
} from "@packages/shared/types/project/projects";
import { handleResponse } from "@/src/shared/api/handleResponse";
import { client } from "@/src/shared/lib/client";

export async function getProjects(): Promise<Project[]> {
  const response = await client.api.v1.projects.$get();

  return await handleResponse<Project[]>(
    response,
    "Impossible de charger les projets",
    "projects/list",
  );
}

export async function createProject(
  data: CreateProjectInput,
): Promise<Project> {
  const response = await client.api.v1.projects.newProjects.$post({
    json: data,
  });

  return await handleResponse<Project>(
    response,
    "Impossible de créer le projet",
    "projects/create-project",
  );
}
