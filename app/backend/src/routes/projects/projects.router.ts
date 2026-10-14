import { createRoute, z } from "@hono/zod-openapi";
import {
  createProjetInput,
  ProjetReponse,
  DeletedProject,
  BoardResponse,
  ErrorResponse,
  ProjectListItem
} from "./projects.schemas";

export const createProjetRoute = createRoute({
  method: "post",
  path: "/newProjects",
  description: "Creates a new project",
  request: {
    body: {
      content: {
        "application/json": {
          schema: createProjetInput,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Project created successfully",
      content: {
        "application/json": {
          schema: ProjetReponse,
        },
      },
    },
    401: {
      description: "Authentication is required.",
      content: {
        "application/json": {
          schema: z.object({ message: z.string() }),
        },
      },
    },
    500: {
      description: "An internal server error occurred.",
      content: {
        "application/json": {
          schema: z.object({ message: z.string() }),
        },
      },
    },
    404: {
      description: "Workspace not found",
      content: {
        "application/json": {
          schema: z.object({ message: z.string() }),
        },
      },
    },
  },
});


export const DeletedProjectRoute = createRoute({
  method: "delete",
  path: "/deletedProject/{id}",
  description: "Deletes an entire project",
  request: {
    params: DeletedProject,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
          }),
        },
      },
      description: "Project deleted successfully",
    },
    401: {
      content: {
        "application/json": {
          schema: z.object({ message: z.string() }),
        },
      },
      description: "Authentication is required.",
    },
    404: {
      content: {
        "application/json": {
          schema: z.object({ message: z.string() }),
        },
      },
      description: "Project not found or access denied",
    },
    500: {
      content: {
        "application/json": {
          schema: z.object({ message: z.string() }),
        },
      },
      description: "An internal server error occurred.",
    },
  },
});

export const getBoardRoute = createRoute({
  method: "get",
  path: "/{projectId}/board",
  description: "Returns the project and all its tasks in a single request.",
  request: {
    params: z.object({
      projectId: z.uuid({ version: "v7" }),
    }),
  },
  responses: {
    200: {
      description: "Project with its tasks",
      content: {
        "application/json": {
          schema: BoardResponse,
        },
      },
    },
    401: {
      description: "Authentication is required.",
      content: { "application/json": { schema: ErrorResponse } },
    },
    404: {
      description: "Project not found",
      content: { "application/json": { schema: ErrorResponse } },
    },
    500: {
      description: "An internal server error occurred.",
      content: { "application/json": { schema: ErrorResponse } },
    },
  },
});


export const listProjectsRoute = createRoute({
  method: "get",
  path: "/",
  description: "Lists all projects of the authenticated user",
  responses: {
    200: {
      description: "Project list",
      content: {
        "application/json": {
          schema: z.array(ProjectListItem),
        },
      },
    },
    401: {
      description: "Authentication is required.",
      content: {
        "application/json": {
          schema: z.object({ message: z.string() }),
        },
      },
    },
    500: {
      description: "An internal server error occurred.",
      content: {
        "application/json": {
          schema: z.object({ message: z.string() }),
        },
      },
    },
  },
});
