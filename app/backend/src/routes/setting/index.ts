import { createOpenAPIHono } from "@backend/src/lib/openapi";
import { getSettingHandler } from "./controler/getSetting";
import { getSettingRoute } from "./setting.router";

/**
 * Module setting — pattern kaneo : une seule instance OpenAPIHono,
 * le middleware vit dans la définition de route (createRoute({ middleware })),
 * les contrôleurs s'enregistrent via .openapi() (pas de sous-app .route()).
 */
export const settingModule = createOpenAPIHono().openapi(
  getSettingRoute,
  getSettingHandler,
);
