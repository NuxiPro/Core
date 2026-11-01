import { createOpenAPIHono } from "@backend/src/lib/openapi";
import { createProjetRoute, DeletedProjectRoute, getBoardRoute, listProjectsRoute } from "./projects.router";
import { createProjectHandler } from "./controler/createProject";
import { deleteProjectHandler } from "./controler/deleted-project";
import { getBoardHandler } from "./controler/get-board";
import { listProjectsHandler } from "./controler/list-projects"; // will create this file

/**
 * Module projects — pattern kaneo : une seule instance OpenAPIHono, toutes les routes
 * sont enregistrées via .openapi().
 */
export const projectsModule = createOpenAPIHono()
  .openapi(createProjetRoute, createProjectHandler)
  .openapi(DeletedProjectRoute, deleteProjectHandler)
  .openapi(getBoardRoute, getBoardHandler)
  .openapi(listProjectsRoute, listProjectsHandler);
