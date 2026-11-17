import { z } from "@hono/zod-openapi";

// Param: project whose archives are managed.
export const ProjectIdParam = z.object({
  projectId: z.uuid({
    version: "v7",
    message: "Invalid ID: UUID format expected",
  }),
});

// Param: id of the archived row (not the original card id).
export const ArchiveIdParam = z.object({
  id: z.uuid({ version: "v7", message: "Invalid ID: UUID format expected" }),
});

// Body: the card to archive.
export const ArchiveTaskBody = z.object({
  taskId: z.uuid({
    version: "v7",
    message: "Invalid ID: UUID format expected",
  }),
});

// Query: list the archives of a project.
export const GetArchivesQuery = z.object({
  projectId: z.uuid({ version: "v7" }),
});

// Mirrors the shared ArchivedTask type (dates as ISO strings over JSON).
export const ArchivedTaskResponse = z.object({
  id: z.uuid({ version: "v7" }),
  title: z.string(),
  description: z.string().nullable(),
  projectId: z.uuid({ version: "v7" }),
  userId: z.string(),
  archivedAt: z.string(),
  createdAt: z.string(),
});

export const ErrorResponse = z.object({ message: z.string() });
