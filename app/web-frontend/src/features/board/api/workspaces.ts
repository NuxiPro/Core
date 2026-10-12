import type {
  CreateWorkspaceInput,
  Workspace,
} from "@packages/shared/types/workspace";
import { handleResponse } from "@/src/shared/api/handleResponse";
import { client } from "@/src/shared/lib/client";

export async function getWorkspaces(): Promise<Workspace[]> {
  const response = await client.api.v1.workspaces.$get();

  return await handleResponse<Workspace[]>(
    response,
    "Impossible de charger les workspaces",
    "workspaces/list",
  );
}

export async function createWorkspace(
  data: CreateWorkspaceInput,
): Promise<Workspace> {
  const response = await client.api.v1.workspaces.NewWorkspace.$post({
    json: data,
  });

  return await handleResponse<Workspace>(
    response,
    "Impossible de créer le workspace",
    "workspaces/create",
  );
}

export async function getWorkspace(id: string): Promise<Workspace> {
  const response = await client.api.v1.workspaces[":id"].$get({
    param: { id },
  });

  return await handleResponse<Workspace>(
    response,
    "Workspace non trouvé",
    "workspaces/get",
  );
}
