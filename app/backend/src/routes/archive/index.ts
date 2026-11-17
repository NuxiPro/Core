import { createOpenAPIHono } from "@backend/src/lib/openapi";
import {
  archiveTaskRoute,
  deleteArchiveRoute,
  getArchivesRoute,
  restoreArchiveRoute,
} from "./archive.router";
import { archiveTaskHandler } from "./controler/archive-task";
import { deleteArchiveHandler } from "./controler/deleted-archive";
import { getArchivesHandler } from "./controler/get-archives";
import { restoreArchiveHandler } from "./controler/restore";

/**
 * Module archive — same pattern as kanban: one OpenAPIHono instance,
 * handlers registered via .openapi() (no sub-app .route()).
 */
export const archiveModule = createOpenAPIHono()
  .openapi(archiveTaskRoute, archiveTaskHandler)
  .openapi(getArchivesRoute, getArchivesHandler)
  .openapi(restoreArchiveRoute, restoreArchiveHandler)
  .openapi(deleteArchiveRoute, deleteArchiveHandler);
