import { createRoute,z } from "@hono/zod-openapi";
import { createWorkspaceSchema, WorkspaceReponse } from "./worspace.shemas";

export const createWorkspaceRoute = createRoute({
  method: "post",
  path: "/NewWorkspace",
  description: "Créer un workspace",
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
      description: "Workspace créé avec succès",
      content: {
        "application/json": {
          schema: WorkspaceReponse,
        },
      },
    },
    401: {
      description: "Non authentifié",
      content: {
        "application/json": {
          schema: z.object({ message: z.string() }),
        },
      },
    },
    500: {
      description: "Erreur interne du serveur",
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
  description: "Retourne le détail d'un workspace",
  request: {
    params: z.object({
      id: z.uuid({ version: "v7" }),
    }),
  },
  responses: {
    200: {
      description: "Détail du workspace",
      content: {
        "application/json": {
          schema: WorkspaceReponse,
        },
      },
    },
    401: {
      description: "Non authentifié",
      content: {
        "application/json": {
          schema: z.object({ message: z.string() }),
        },
      },
    },
    404: {
      description: "Workspace non trouvé",
      content: {
        "application/json": {
          schema: z.object({ message: z.string() }),
        },
      },
    },
    500: {
      description: "Erreur interne du serveur",
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
  description: "Liste tous les workspaces de l'utilisateur connecté",
  responses: {
    200: {
      description: "Liste des workspaces",
      content: {
        "application/json": {
          schema: z.array(WorkspaceReponse),
        },
      },
    },
    401: {
      description: "Non authentifié",
      content: {
        "application/json": {
          schema: z.object({ message: z.string() }),
        },
      },
    },
    500: {
      description: "Erreur interne du serveur",
      content: {
        "application/json": {
          schema: z.object({ message: z.string() }),
        },
      },
    },
  },
});
