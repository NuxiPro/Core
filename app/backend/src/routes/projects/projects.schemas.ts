import { z } from "@hono/zod-openapi";
import { COLUMN_IDS } from "@packages/shared/config/index-frontend";

export const createProjetInput = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "At least 1 character" })
    .max(30)
    .refine((val) => !/[<>]/.test(val), {
      message: "Characters < and > are not allowed",
    }),
  description: z
    .string()
    .max(200, { message: "Description too long" })
    .default("")
    .refine((val) => !/[<>]/.test(val), {
      message:
        "Characters < and > are not allowed in the description",
    }),
  workspaceId: z.string(),
});

export const ProjetReponse = z.object({
  id: z.uuid({ version: "v7" }),
  name: z.string(),
  description: z.string().nullable(),
  slug: z.string(),
  createdAt: z.string(),
});


export const DeletedProject = z.object({
  id: z.uuid({ version: "v7", message: "Invalid ID: UUID format expected" }),
});


export const TaskSummaryResponse = z.object({
  id: z.uuid({ version: "v7" }),
  title: z.string().max(255),
  colId: z.enum(COLUMN_IDS),
  positionString: z.string(),
  createdAt: z.string(),
});

export const BoardResponse = z.object({
  id: z.uuid({ version: "v7" }),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  createdAt: z.string(),
  tasks: z.array(TaskSummaryResponse),
});

export const ErrorResponse = z.object({ message: z.string() });

export const ProjectListItem = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  createdAt: z.string(),
});
