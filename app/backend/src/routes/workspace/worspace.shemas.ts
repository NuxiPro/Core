import { z } from "@hono/zod-openapi";

export const createWorkspaceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(30, "Workspace name must not exceed 30 characters")
    .refine((val) => !/[<>]/.test(val), {
      message: "Characters < and > are not allowed",
    }),
});

export const WorkspaceReponse = z.object({
  id: z.uuid({ version: "v7" }),
  name: z.string(),
  createdAt: z.string(),
});
