import { createOpenAPIHono } from "@backend/src/openapi";
import {
  archiveTaskRoute,
  deleteArchiveRoute,
  getArchiveRoute,
  getArchivesRoute,
  restoreArchiveRoute,
  updateArchiveRoute,
} from "./archive.router";
import { archiveTaskHandler } from "./controler/archive-task";
import { deleteArchiveHandler } from "./controler/deleted-archive";
import { getArchiveHandler } from "./controler/get-archive";
import { getArchivesHandler } from "./controler/get-archives";
import { restoreArchiveHandler } from "./controler/restore";
import { updateArchiveHandler } from "./controler/update-archive";

/**
 * Module archive — same pattern as kanban: one OpenAPIHono instance,
 * handlers registered via .openapi() (no sub-app .route()).
 */
export const archiveModule = createOpenAPIHono()
  .openapi(archiveTaskRoute, archiveTaskHandler)
  .openapi(getArchivesRoute, getArchivesHandler)
  .openapi(getArchiveRoute, getArchiveHandler)
  .openapi(updateArchiveRoute, updateArchiveHandler)
  .openapi(restoreArchiveRoute, restoreArchiveHandler)
  .openapi(deleteArchiveRoute, deleteArchiveHandler);
