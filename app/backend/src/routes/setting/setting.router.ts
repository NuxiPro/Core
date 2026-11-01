import { createRoute} from "@hono/zod-openapi";
import { requirePermission } from "@backend/src/lib/auth-middleware";
import { ErrorResponse, GetSetting } from "./setting.shemas";

export const getSettingRoute = createRoute({
  method: "get",
  path: "/getSettings",
  description: "Get all setting in one request",
  middleware: [requirePermission({ setting: ["read"] })],
  responses: {
    200: {
      description: "charger tous les paramètre en une seule requête",
      content: {
        "application/json": {
          schema: GetSetting,
        },
      },
    },
    500: {
      description: "An internal server error occurred.",
      content: { "application/json": { schema: ErrorResponse } },
    },
  },
})
