import { OpenAPIHono } from "@hono/zod-openapi";
import createTask from "./controler/create";
import deletedTask from "./controler/deleted-Task";
import updateTaskPosition from "./controler/updateTaskPosition";
import getTask from "./controler/get-task";
import updateTask from "./controler/update-Task";

export const kanbanModule = new OpenAPIHono()
  .route("/", createTask)
  .route("/", deletedTask)
  .route("/", updateTask)
  .route("/", getTask)
  .route("/", updateTaskPosition);
