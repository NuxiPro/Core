import { createRoute, z } from "@hono/zod-openapi";
import {
  CreateTaskInput,
  CreateTaskResponse,
  DeletedTask,
  GetTaskDetailResponse,
  GetTaskSummaryResponse,
  ErrorResponse,
  TaskIdParam,
  UpdateTaskBody,
  UpdatePositionBody,
  TaskPositionParam,
} from "./task.shemas";

const AuthErrorResponse = z.union([
  ErrorResponse,
  z.object({ error: z.string() }),
  z.object({ error: z.object({ message: z.string() }) }),
]);

const ForbiddenResponse = z.object({ error: z.string() });

const jsonContent = (schema: z.ZodType) => ({
  "application/json": { schema },
});

export const createTaskRoute = createRoute({
  method: "post",
  path: "/{projectId}/newTask",
  description:
    "Creates a task in the specified project after validating the request payload.",
  request: {
    params: z.object({
      projectId: z.uuid({ version: "v7" }),
    }),
    body: {
      content: jsonContent(CreateTaskInput),
    },
  },
  responses: {
    201: {
      description: "Task created successfully.",
      content: jsonContent(CreateTaskResponse),
    },
    401: {
      description: "Authentication is required.",
      content: jsonContent(AuthErrorResponse),
    },
    403: {
      description: "The authenticated user does not have permission to create tasks.",
      content: jsonContent(ForbiddenResponse),
    },
    404: {
      description: "Project not found or not accessible.",
      content: jsonContent(ErrorResponse),
    },
    500: {
      description: "An internal server error occurred.",
      content: jsonContent(ErrorResponse),
    },
  },
});

export const deletedTaskRoute = createRoute({
  method: "delete",
  path: "/deletedTask/{id}",
  description: "Deletes a task by ID if it belongs to the authenticated user.",
  request: {
    params: DeletedTask,
  },
  responses: {
    200: {
      description: "Task deleted successfully.",
      content: jsonContent(z.object({ success: z.boolean() })),
    },
    401: {
      description: "Authentication is required.",
      content: jsonContent(AuthErrorResponse),
    },
    403: {
      description: "The authenticated user does not have permission to delete tasks.",
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

export const getTaskDetailRoute = createRoute({
  method: "get",
  path: "/getTask/{id}",
  description: "Returns the full details of a task by ID.",
  request: {
    params: z.object({
      id: z.uuid({ version: "v7" }),
    }),
  },
  responses: {
    200: {
      description: "Task details returned successfully.",
      content: jsonContent(GetTaskDetailResponse),
    },
    401: {
      description: "Authentication is required.",
      content: jsonContent(AuthErrorResponse),
    },
    403: {
      description: "The authenticated user does not have permission to read tasks.",
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

export const getTasksRoute = createRoute({
  method: "get",
  path: "/getTask",
  description: "Returns a paginated summary list of tasks for a project.",
  request: {
    query: z.object({
      projectId: z.uuid({ version: "v7" }),
      limit: z.coerce.number().min(1).max(100).default(20),
      offset: z.coerce.number().min(0).default(0),
    }),
  },
  responses: {
    200: {
      description: "Task summaries returned successfully.",
      content: jsonContent(z.array(GetTaskSummaryResponse)),
    },
    401: {
      description: "Authentication is required.",
      content: jsonContent(AuthErrorResponse),
    },
    403: {
      description: "The authenticated user does not have permission to read tasks.",
      content: jsonContent(ForbiddenResponse),
    },
    500: {
      description: "An internal server error occurred.",
      content: jsonContent(ErrorResponse),
    },
  },
});

export const updateTaskRoute = createRoute({
  method: "patch",
  path: "/updateTask/{id}",
  description: "Updates a task by ID if it belongs to the authenticated user.",
  request: {
    params: TaskIdParam,
    body: {
      content: jsonContent(UpdateTaskBody),
    },
  },
  responses: {
    200: {
      description: "Task updated successfully.",
      content: jsonContent(
        z.object({
          success: z.boolean(),
          data: z.object({
            id: z.uuid({ version: "v7" }),
            title: z.string(),
            description: z.string(),
            colId: z.string(),
            priority: z.string().optional(),
            positionString: z.string(),
            createdAt: z.string(),
            updatedAt: z.string(),
          }),
        }),
      ),
    },
    400: {
      description: "The request payload is invalid or empty.",
      content: jsonContent(ErrorResponse),
    },
    401: {
      description: "Authentication is required.",
      content: jsonContent(AuthErrorResponse),
    },
    403: {
      description: "The authenticated user does not have permission to update tasks.",
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

export const updateTaskPositionRoute = createRoute({
  method: "patch",
  path: "/updateTaskPosition/{id}",
  description: "Moves a task to a new position using fractional indexing.",
  request: {
    params: TaskPositionParam,
    body: {
      content: jsonContent(UpdatePositionBody),
    },
  },
  responses: {
    200: {
      description: "Task position updated successfully.",
      content: jsonContent(
        z.object({ success: z.boolean(), newPosition: z.string() }),
      ),
    },
    400: {
      description: "The request payload is invalid.",
      content: jsonContent(ErrorResponse),
    },
    401: {
      description: "Authentication is required.",
      content: jsonContent(AuthErrorResponse),
    },
    403: {
      description: "The authenticated user does not have permission to move tasks.",
      content: jsonContent(ForbiddenResponse),
    },
    404: {
      description: "Task not found or not accessible.",
      content: jsonContent(ErrorResponse),
    },
    409: {
      description: "The requested position cannot be computed safely.",
      content: jsonContent(ErrorResponse),
    },
    500: {
      description: "An internal server error occurred.",
      content: jsonContent(ErrorResponse),
    },
  },
});
