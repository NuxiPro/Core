import { OpenAPIHono } from "@hono/zod-openapi";
import createProject from "./controler/createProject";
import deletedProjet from "./controler/deleted-project";
import getBoard from "./controler/get-board";
import listProjects from "./controler/list";

export const projectsModule = new OpenAPIHono()
  .route("/", listProjects)
  .route("/", createProject)
  .route("/", getBoard)
  .route("/", deletedProjet);
