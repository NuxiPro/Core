import { z } from "@hono/zod-openapi";
import { priorityStyles } from "@packages/shared/types/task/priority-level";

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

// Full detail (step 2, on click). Mirrors the shared ArchivedTask type
// (dates as ISO strings over JSON).
export const ArchivedTaskResponse = z.object({
  id: z.uuid({ version: "v7" }),
  title: z.string(),
  description: z.string().nullable(),
  projectId: z.uuid({ version: "v7" }),
  priority: z.string().nullable(),
  dueDate: z.string().nullable(),
  userId: z.string(),
  archivedAt: z.string(),
  createdAt: z.string(),
});

// Light list row (step 1): id + title (max 255 chars) + dates only.
// Keeps the archive panel fast even with 10k+ archived tasks —
// the heavy description (up to 50K chars) comes with the detail.
export const ArchivedTaskSummaryResponse = z.object({
  id: z.uuid({ version: "v7" }),
  title: z.string().max(255),
  projectId: z.uuid({ version: "v7" }),
  userId: z.string(),
  archivedAt: z.string(),
  createdAt: z.string(),
});

// Body: edit an archived task in place (the row stays in archived_cards).
export const UpdateArchiveBody = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(50000).optional(),
  priority: z
    .enum(Object.keys(priorityStyles) as [string, ...string[]])
    .optional(),
  // ISO datetime, null to clear, undefined to leave untouched.
  // z.iso.datetime is the zod v4 replacement for the deprecated
  // z.string().datetime() — it still rejects any non-ISO string.
  dueDate: z.iso.datetime({ offset: true }).nullish(),
});

export const ErrorResponse = z.object({ message: z.string() });
