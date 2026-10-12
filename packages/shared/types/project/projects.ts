export type CreateProjectInput = {
  name: string;
  description?: string;
  workspaceId: string;
};

export type Project = {
  id: string;
  name: CreateProjectInput["name"];
  description: CreateProjectInput["description"];
  prefix: string;
  slug: string;
  createdAt: string;
  workspaceId: CreateProjectInput['workspaceId'];
};
