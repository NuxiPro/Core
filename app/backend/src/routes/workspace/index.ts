import { OpenAPIHono } from "@hono/zod-openapi";
import createWorkspace from "./controler/CreateWorkspace";
import getWorkspace from "./controler/getWorkspace";
import listWorkspaces from "./controler/list-workspace";

export const workspacesModule = new OpenAPIHono()
  .route("/", listWorkspaces)
  .route("/", createWorkspace)
  .route("/", getWorkspace);
