import type { AppEnv } from "@backend/src";
import { OpenAPIHono } from "@hono/zod-openapi";

export function createOpenAPIHono(): OpenAPIHono<AppEnv> {
  return new OpenAPIHono<AppEnv>({
    defaultHook: (result, c) => {
      if (!result.success) {
        return c.json({ error: "Données invalides" }, 400);
      }
    },
  });
}
