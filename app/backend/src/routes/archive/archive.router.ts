import { requirePermission } from "@backend/src/lib/auth-middleware";
import { createRoute, z } from "@hono/zod-openapi";
import {
  ArchivedTaskResponse,
  ArchiveIdParam,
  ArchiveTaskBody,
  ErrorResponse,
  GetArchivesQuery,
  ProjectIdParam,
} from "./archive.schemas";

const AuthErrorResponse = z.union([
  ErrorResponse,
  z.object({ error: z.string() }),
  z.object({ error: z.object({ message: z.string() }) }),
]);

const ForbiddenResponse = z.object({ error: z.string() });

// Same helper as task.router.ts: the exact schema type flows into
// c.req.valid(), so no manual cast is needed in the handlers.
const jsonContent = <T extends z.ZodType>(schema: T) => ({
  "application/json": { schema },
});

// Archive a task: transactional move cards -> archived_cards.
export const archiveTaskRoute = createRoute({
  method: "post",
  path: "/{projectId}/newArchive",
  description:
    "Archives a task by moving it from the board to the archive table (transactional: no data loss).",
  middleware: [requirePermission({ archive: ["create"] })],
  request: {
    params: ProjectIdParam,
    body: {
      content: jsonContent(ArchiveTaskBody),
    },
  },
  responses: {
    201: {
      description: "Task archived successfully.",
      content: jsonContent(ArchivedTaskResponse),
    },
    401: {
      description: "Authentication is required.",
      content: jsonContent(AuthErrorResponse),
    },
    403: {
      description:
        "The authenticated user does not have permission to archive tasks.",
      content: jsonContent(ForbiddenResponse),
    },
    404: {
      description: "Task not found or not accessible.",
      content: jsonContent(ErrorResponse),
    },
    500: {
      description: "An internal server error occurred.",
      content: jsonContent(ErrorResponse),
    },
  },
});

// List the archived tasks of a project, newest first.
export const getArchivesRoute = createRoute({
  method: "get",
  path: "/getArchives",
  description:
    "Returns the archived tasks of a project, newest first (served by the projectId + archivedAt index).",
  middleware: [requirePermission({ archive: ["read"] })],
  request: {
    query: GetArchivesQuery,
  },
  responses: {
    200: {
      description: "Archived tasks returned successfully.",
      content: jsonContent(z.array(ArchivedTaskResponse)),
    },
    401: {
      description: "Authentication is required.",
      content: jsonContent(AuthErrorResponse),
    },
    403: {
      description:
        "The authenticated user does not have permission to read archives.",
      content: jsonContent(ForbiddenResponse),
    },
    500: {
      description: "An internal server error occurred.",
      content: jsonContent(ErrorResponse),
    },
  },
});

// Restore: move the archived task back onto the board (transactional).
export const restoreArchiveRoute = createRoute({
  method: "patch",
  path: "/restoreArchive/{id}",
  description:
    "Restores an archived task back onto the board, at the end of its original column (transactional).",
  middleware: [requirePermission({ archive: ["update"] })],
  request: {
    params: ArchiveIdParam,
  },
  responses: {
    200: {
      description: "Task restored successfully.",
      content: jsonContent(z.object({ success: z.boolean() })),
    },
    401: {
      description: "Authentication is required.",
      content: jsonContent(AuthErrorResponse),
    },
    403: {
      description:
        "The authenticated user does not have permission to restore tasks.",
      content: jsonContent(ForbiddenResponse),
    },
    404: {
      description: "Archived task not found or not accessible.",
      content: jsonContent(ErrorResponse),
    },
    500: {
      description: "An internal server error occurred.",
      content: jsonContent(ErrorResponse),
    },
  },
});

// Permanently delete one archived task.
export const deleteArchiveRoute = createRoute({
  method: "delete",
  path: "/deletedArchive/{id}",
  description: "Permanently deletes one archived task.",
  middleware: [requirePermission({ archive: ["delete"] })],
  request: {
    params: ArchiveIdParam,
  },
  responses: {
    200: {
      description: "Archived task deleted successfully.",
      content: jsonContent(z.object({ success: z.boolean() })),
    },
    401: {
      description: "Authentication is required.",
      content: jsonContent(AuthErrorResponse),
    },
    403: {
      description:
        "The authenticated user does not have permission to delete archives.",
      content: jsonContent(ForbiddenResponse),
    },
    404: {
      description: "Archived task not found or not accessible.",
      content: jsonContent(ErrorResponse),
    },
    500: {
      description: "An internal server error occurred.",
      content: jsonContent(ErrorResponse),
    },
  },
});
