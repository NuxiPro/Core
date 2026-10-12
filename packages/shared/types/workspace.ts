export type CreateWorkspaceInput = {
  name: string;
};

export type Workspace = {
  id: string;
  name: CreateWorkspaceInput["name"];
  createdAt: string;
};
