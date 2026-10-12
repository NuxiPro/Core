import { z } from "@hono/zod-openapi";
import { COLUMN_IDS } from "@packages/shared/config/index-frontend";
import { priorityStyles } from "@packages/shared/types/task/priority-level";


// Schémas de donnée reçu par le client
export const CreateTaskInput = z.object({
  title: z
    .string()
    .trim()
    .min(1, { message: "Le titre ne peut pas être vide" })
    .max(255, { message: "Trop long, veuillez écrire dans la description" }),
  colId: z.enum(COLUMN_IDS),
});

export const CreateTaskResponse = z.object({
  id: z.uuid({ version: "v7" }),
  title: z.string(),
  colId: z.enum(COLUMN_IDS),
  createdAt: z.string(),
  positionString: z.string(),
});


export const DeletedTask = z.object({
  id: z.uuid({ version: "v7", message: "ID invalide : format UUID attendu" }),
});


// Get task ===
export const GetTaskSummaryResponse = z.object({
  id: z.uuid({ version: "v7" }),
  title: z.string().max(255),
  colId: z.enum(COLUMN_IDS),
  positionString: z.string(),
  createdAt: z.string(),
});

/** Réponse complète pour le détail d'une tâche. */
export const GetTaskDetailResponse = z.object({
  id: z.uuid({ version: "v7" }),
  title: z.string(),
  description: z.string().nullable(),
  colId: z.enum(COLUMN_IDS),
  priority: z.string().nullable(),
  positionString: z.string(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});

export const ErrorResponse = z.object({ message: z.string() });
// ===


// ===Mettre à jours une tâches===
export const TaskIdParam = z.object({
  id: z.uuid({ version: "v7", message: "ID invalide : format UUID attendu" }),
});

// 2. Schéma pour valider les modifications (Body JSON)
export const UpdateTaskBody = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(50000).optional(),
  priority: z
    .enum(Object.keys(priorityStyles) as [string, ...string[]])
    .optional(),
});
// ===


// Gestion de position/drag drop ===
export const TaskPositionParam = z.object({
  id: z.uuid({ version: "v7", message: "ID invalide : format UUID attendu" }),
});

export const UpdatePositionBody = z.object({
  colId: z.enum(COLUMN_IDS).openapi({ description: "Colonne cible" }),
  overTaskId: z
    .string()
    .uuid({ version: "v7"})
    .nullable()
    .openapi({ description: "ID survolé, null = colonne vide / drop colonne" }),
  insertBefore: z
    .boolean()
    .openapi({ description: "true = moitié haute (avant), false = moitié basse (après)" }),
});
