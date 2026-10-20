export { createLogger, C} from "@packages/shared/utils/logger";
import { createLogger, C } from "@packages/shared/utils/logger";
import type { MiddlewareHandler } from "hono";

// Helper interne pour formater le code HTTP avec la bonne couleur ANSI
const formatStatus = (status: number): string => {
  const color = status >= 500 ? C.red : status >= 400 ? C.yellow : C.green;
  return `${color}${status}${C.reset}`;
};

export function httpLogger(): MiddlewareHandler {
  const log = createLogger("http");

  return async (c, next) => {
    const start = Date.now();

    await next();

    const ms = Date.now() - start;
    const { method, path } = c.req;
    const { status } = c.res;

    const message = `${method} ${path} → ${formatStatus(status)} (${ms}ms)`;

    if (status >= 500) {
      log.error(message);
    } else if (status >= 400) {
      log.warn(message);
    } else {
      log.info(message);
    }
  };
}
