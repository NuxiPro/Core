// biome-ignore-all lint/suspicious/noConsole: tslog owns output; local magic links are an intentional exception.

import type { MiddlewareHandler } from "hono";
import { createLogger as createTsLogger } from "tslog";

const isDevelopment = process.env.NODE_ENV === "development";
const isProduction = process.env.NODE_ENV === "production";
const isTest = process.env.NODE_ENV === "test";

const logger = createTsLogger({
  name: "NuxiPro",
  type: isProduction ? "json" : isTest ? "hidden" : "pretty",
  minLevel: isDevelopment ? "DEBUG" : "ERROR",
  customLevels: { ALERT: 5.5 } as const,
  json: {
    messageKey: "msg",
    levelKey: "level",
    timeKey: "ts",
    numericLevel: false,
  },
  pretty: {
    levelMethod: {
      ALERT: console.error,
      ERROR: console.error,
      FATAL: console.error,
      WARN: console.warn,
      "*": console.log,
    },
  },
  mask: {
    keys: [
      "password",
      "passphrase",
      "secret",
      "token",
      "authorization",
      "cookie",
      "credentials",
      "email",
      "phone",
      "phoneNumber",
      "apiKey",
      "accessKey",
      "refreshKey",
      "privateKey",
      "credential",
      "session",
      "sessionId",
      "magicLink",
      "databaseUrl",
      "url",
      "body",
      "payload",
      "query",
      "content",
      "title",
      "description",
      "name",
      "user",
      "userId",
      "userData",
      "userProfile",
      "task",
      "taskId",
      "tasks",
      "tasksByColumn",
      "project",
      "projectId",
      "projects",
      "workspace",
      "workspaceId",
      "profile",
      "slug",
      "id",
      "ip",
      "otp",
      "authCode",
      "verificationCode",
    ],
    caseInsensitive: true,
    placeholder: "[REDACTED]",
    regex: [
      /\bBearer\s+\S+/gi,
      /\b(?:https?|postgres(?:ql)?|mysql):\/\/[^\s"'<>]+/gi,
      /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
      /\b(password|passphrase|secret|token|api[_-]?key|authorization|cookie|session|email|url|name|title|description|user(?:id)?|task(?:id)?|project(?:id)?|workspace(?:id)?)\s*[:=]\s*[^\s,;]+/gi,
      /\b(?:magic[_-]?link|auth[_-]?code|verification[_-]?code|otp)\s*[:=]\s*[^\s,;]+/gi,
      /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/gi,
    ],
  },
});

export function createLogger(context: string, minLevel?: "DEBUG" | "INFO") {
  const scopedLogger = logger.getSubLogger({
    name: context,
    bindings: { ctx: context },
    ...(minLevel ? { minLevel } : {}),
  }) as ReturnType<typeof logger.getSubLogger> & Pick<typeof logger, "alert">;

  return {
    debug(message: string, extra?: unknown): void {
      if (extra === undefined) scopedLogger.debug(message);
      else scopedLogger.debug({ extra }, message);
    },
    info(message: string, extra?: unknown): void {
      if (extra === undefined) scopedLogger.info(message);
      else scopedLogger.info({ extra }, message);
    },
    warn(message: string, extra?: unknown): void {
      if (extra === undefined) scopedLogger.warn(message);
      else scopedLogger.warn({ extra }, message);
    },
    alert(message: string, extra?: unknown): void {
      if (extra === undefined) scopedLogger.alert(message);
      else scopedLogger.alert({ extra }, message);
    },
    error(message: string, detail?: unknown): void {
      if (detail instanceof Error) {
        scopedLogger.error({ error: detail }, message);
      } else if (detail === undefined) {
        scopedLogger.error(message);
      } else {
        scopedLogger.error({ extra: detail }, message);
      }
    },
    devMagicLink(url: string): void {
      if (isDevelopment) console.info(`[Magic Link] ${url}`);
    },
    attachTransport: scopedLogger.attachTransport.bind(scopedLogger),
  };
}

export function httpLogger(): MiddlewareHandler {
  const log = createLogger("http");

  return async (c, next) => {
    const start = Date.now();

    await next();

    const ms = Date.now() - start;
    const { method, path } = c.req;
    const { status } = c.res;

    const message = `${method} ${path} → ${status} (${ms}ms)`;

    if (status >= 500) {
      log.error(message);
    } else if (status >= 400) {
      log.warn(message);
    } else {
      log.info(message);
    }
  };
}
