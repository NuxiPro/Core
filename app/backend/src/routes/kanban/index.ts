import { createOpenAPIHono } from "@backend/src/lib/openapi";
import { createTaskHandler } from "./controler/create";
import { deletedTaskHandler } from "./controler/deleted-Task";
import { getTasksHandler, getTaskDetailHandler } from "./controler/get-task";
import { updateTaskHandler } from "./controler/update-Task";
import { updateTaskPositionHandler } from "./controler/updateTaskPosition";
import {
  createTaskRoute,
  deletedTaskRoute,
  getTaskDetailRoute,
  getTasksRoute,
  updateTaskPositionRoute,
  updateTaskRoute,
} from "./task.router";

/**
 * Module kanban — pattern kaneo : une seule instance OpenAPIHono,
 * le middleware vit dans les définitions de route (createRoute({ middleware })),
 * les contrôleurs s'enregistrent via .openapi() (pas de sous-app .route()).
 */
export const kanbanModule = createOpenAPIHono()
  .openapi(createTaskRoute, createTaskHandler)
  .openapi(deletedTaskRoute, deletedTaskHandler)
  .openapi(updateTaskRoute, updateTaskHandler)
  .openapi(getTasksRoute, getTasksHandler)
  .openapi(getTaskDetailRoute, getTaskDetailHandler)
  .openapi(updateTaskPositionRoute, updateTaskPositionHandler);
