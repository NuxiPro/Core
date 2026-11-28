import { createOpenAPIHono } from "@backend/src/openapi";
import {
  createProjetRoute,
  DeletedProjectRoute,
  getBoardRoute,
  getProjectRoute,
  listProjectsRoute,
  updateProjectRoute,
} from "./projects.router";
import { createProjectHandler } from "./controler/createProject";
import { deleteProjectHandler } from "./controler/deleted-project";
import { getBoardHandler } from "./controler/get-board";
import { listProjectsHandler } from "./controler/list-projects";
import {
  getProjectHandler,
  updateProjectHandler,
} from "./controler/project-settings";

export const projectsModule = createOpenAPIHono()
  .openapi(createProjetRoute, createProjectHandler)
  .openapi(DeletedProjectRoute, deleteProjectHandler)
  .openapi(getProjectRoute, getProjectHandler)
  .openapi(updateProjectRoute, updateProjectHandler)
  .openapi(getBoardRoute, getBoardHandler)
  .openapi(listProjectsRoute, listProjectsHandler);
