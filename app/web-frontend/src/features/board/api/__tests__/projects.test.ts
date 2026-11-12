import { beforeEach, describe, expect, it, vi } from "vitest";

const { getProjectsRequest, createProjectRequest, handleResponseMock } =
  vi.hoisted(() => ({
    getProjectsRequest: vi.fn(),
    createProjectRequest: vi.fn(),
    handleResponseMock: vi.fn(),
  }));

vi.mock("@/src/shared/lib/client", () => ({
  client: {
    api: {
      v1: {
        projects: {
          $get: getProjectsRequest,
          newProjects: { $post: createProjectRequest },
        },
      },
    },
  },
}));

vi.mock("@/src/shared/api/handleResponse", () => ({
  handleResponse: handleResponseMock,
}));

import { createProject, getProjects } from "../projects";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("projects API", () => {
  it("fetches projects with the expected context", async () => {
    const projects = [{ id: "project-1", slug: "my-project" }];
    const response = { ok: true };
    getProjectsRequest.mockResolvedValue(response);
    handleResponseMock.mockResolvedValue(projects);

    await expect(getProjects()).resolves.toEqual(projects);

    expect(getProjectsRequest).toHaveBeenCalledOnce();
    expect(handleResponseMock).toHaveBeenCalledWith(
      response,
      "Impossible de charger les projets",
      "projects/list",
    );
  });

  it("creates a project with the received data", async () => {
    const input = {
      name: "My project",
      description: "Description",
      workspaceId: "workspace-1",
    };
    const response = { ok: true };
    const project = { id: "project-1", slug: "my-project" };
    createProjectRequest.mockResolvedValue(response);
    handleResponseMock.mockResolvedValue(project);

    await expect(createProject(input)).resolves.toEqual(project);

    expect(createProjectRequest).toHaveBeenCalledWith({ json: input });
    expect(handleResponseMock).toHaveBeenCalledWith(
      response,
      "Impossible de créer le projet",
      "projects/create-project",
    );
  });
});
