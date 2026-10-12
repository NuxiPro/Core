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
  description: "Cette route permet de créer un projet",
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
      description: "Projet créé avec succès",
      content: {
        "application/json": {
          schema: ProjetReponse,
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
    404: {
      description: "Workspace non trouvé",
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
  description: "Cette route permet de supprimer un projet entier",
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
      description: "Projects supprimer avec succès",
    },
    401: {
      content: {
        "application/json": {
          schema: z.object({ message: z.string() }),
        },
      },
      description: "Non authentifié",
    },
    404: {
      content: {
        "application/json": {
          schema: z.object({ message: z.string() }),
        },
      },
      description: "Project introuvable ou accès non autorisé",
    },
    500: {
      content: {
        "application/json": {
          schema: z.object({ message: z.string() }),
        },
      },
      description: "Erreur interne du serveur",
    },
  },
});

export const getBoardRoute = createRoute({
  method: "get",
  path: "/{projectId}/board",
  description: "Retourne le projet et toutes ses tâches en une seule requête.",
  request: {
    params: z.object({
      projectId: z.uuid({ version: "v7" }),
    }),
  },
  responses: {
    200: {
      description: "Projet avec ses tâches",
      content: {
        "application/json": {
          schema: BoardResponse,
        },
      },
    },
    401: {
      description: "Non authentifié",
      content: { "application/json": { schema: ErrorResponse } },
    },
    404: {
      description: "Projet non trouvé",
      content: { "application/json": { schema: ErrorResponse } },
    },
    500: {
      description: "Erreur interne du serveur",
      content: { "application/json": { schema: ErrorResponse } },
    },
  },
});


export const listProjectsRoute = createRoute({
  method: "get",
  path: "/",
  description: "Liste tous les projets de l'utilisateur connecté",
  responses: {
    200: {
      description: "Liste des projets",
      content: {
        "application/json": {
          schema: z.array(ProjectListItem),
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
