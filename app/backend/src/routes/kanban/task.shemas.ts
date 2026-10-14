import { z } from "@hono/zod-openapi";
import { COLUMN_IDS } from "@packages/shared/config/index-frontend";
import { priorityStyles } from "@packages/shared/types/task/priority-level";


// Schemas for data received from the client
export const CreateTaskInput = z.object({
  title: z
    .string()
    .trim()
    .min(1, { message: "Title must not be empty" })
    .max(255, { message: "Too long, please use the description instead" }),
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
  id: z.uuid({ version: "v7", message: "Invalid ID: UUID format expected" }),
});


// Get task ===
export const GetTaskSummaryResponse = z.object({
  id: z.uuid({ version: "v7" }),
  title: z.string().max(255),
  colId: z.enum(COLUMN_IDS),
  dueDate: z.string().nullable(),
  positionString: z.string(),
  createdAt: z.string(),
});

/** Full response for task detail. */
export const GetTaskDetailResponse = z.object({
  id: z.uuid({ version: "v7" }),
  title: z.string(),
  description: z.string().nullable(),
  colId: z.enum(COLUMN_IDS),
  dueDate: z.string().nullable(),
  priority: z.string().nullable(),
  positionString: z.string(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});

export const ErrorResponse = z.object({ message: z.string() });
// ===


// === Update a task ===
export const TaskIdParam = z.object({
  id: z.uuid({ version: "v7", message: "Invalid ID: UUID format expected" }),
});

// 2. Schema to validate updates (JSON body)
export const UpdateTaskBody = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(50000).optional(),
  priority: z
    .enum(Object.keys(priorityStyles) as [string, ...string[]])
    .optional(),
  // ISO datetime, null to clear, undefined to leave untouched.
  dueDate: z.string().datetime({ offset: true }).nullish(),
});
// ===


// Position / drag & drop handling ===
export const TaskPositionParam = z.object({
  id: z.uuid({ version: "v7", message: "Invalid ID: UUID format expected" }),
});

export const UpdatePositionBody = z.object({
  colId: z.enum(COLUMN_IDS).openapi({ description: "Target column" }),
  overTaskId: z
    .string()
    .uuid({ version: "v7"})
    .nullable()
    .openapi({ description: "Hovered ID, null = empty column / column drop" }),
  insertBefore: z
    .boolean()
    .openapi({ description: "true = top half (before), false = bottom half (after)" }),
});
