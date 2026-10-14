import { createRoute,z } from "@hono/zod-openapi";
import { createWorkspaceSchema, WorkspaceReponse } from "./worspace.shemas";

export const createWorkspaceRoute = createRoute({
  method: "post",
  path: "/NewWorkspace",
  description: "Creates a workspace",
  request: {
    body: {
      content: {
        "application/json": {
          schema: createWorkspaceSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Workspace created successfully",
      content: {
        "application/json": {
          schema: WorkspaceReponse,
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


export const getWorkspaceRoute = createRoute({
  method: "get",
  path: "/{id}",
  description: "Returns workspace details",
  request: {
    params: z.object({
      id: z.uuid({ version: "v7" }),
    }),
  },
  responses: {
    200: {
      description: "Workspace details",
      content: {
        "application/json": {
          schema: WorkspaceReponse,
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
    404: {
      description: "Workspace not found",
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


export const listWorkspacesRoute = createRoute({
  method: "get",
  path: "/",
  description: "Lists all workspaces of the authenticated user",
  responses: {
    200: {
      description: "Workspace list",
      content: {
        "application/json": {
          schema: z.array(WorkspaceReponse),
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
