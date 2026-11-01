import { createOpenAPIHono } from "@backend/src/lib/openapi";
import { createWorkspaceRoute, getWorkspaceRoute, listWorkspacesRoute } from "./workspace.router";
import { createWorkspaceHandler } from "./controler/CreateWorkspace";
import { getWorkspaceHandler } from "./controler/getWorkspace";
import { listWorkspacesHandler } from "./controler/list-workspace";

/**
 * Module workspace — pattern kaneo : une seule instance OpenAPIHono.
 */
export const workspaceModule = createOpenAPIHono()
  .openapi(createWorkspaceRoute, createWorkspaceHandler)
  .openapi(getWorkspaceRoute, getWorkspaceHandler)
  .openapi(listWorkspacesRoute, listWorkspacesHandler);
