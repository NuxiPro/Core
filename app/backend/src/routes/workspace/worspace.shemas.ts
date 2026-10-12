import { z } from "@hono/zod-openapi";

export const createWorkspaceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Le nom est obligatoire")
    .max(30, "Le nom du workspace ne doit pas dépasser 30 caractères")
    .refine((val) => !/[<>]/.test(val), {
      message: "Les caractères < et > ne sont pas autorisés",
    }),
});

export const WorkspaceReponse = z.object({
  id: z.uuid({ version: "v7" }),
  name: z.string(),
  createdAt: z.string(),
});
