import { kanbanModule } from "@backend/src/routes/kanban/index";
import { OpenAPIHono } from "@hono/zod-openapi";
import type { Context } from "hono";
import { compress } from "hono/compress";
import { cors } from "hono/cors";
import { createMiddleware } from "hono/factory";
import { secureHeaders } from "hono/secure-headers";
import { auth } from "./auth";
import { apiRateLimit } from "./lib/api-rate-limit";
import { securityAlert } from "./lib/security-alert";
import { httpLogger } from "./logique/logging/logger";
import { projectsModule } from "./routes/projects";
import { workspacesModule } from "./routes/workspace";

const allowedOrigin = process.env.FRONTEND_URL_ALLOWED;
if (!allowedOrigin) {
  throw new Error("FRONTEND_URL_ALLOWED is not defined in .env");
}

const frontendUrl = allowedOrigin.split(",")[0];

// Post-auth landing redirects (paths mirror the frontend router).
const authRedirect = (path: string, withError: boolean) => (c: Context) => {
  const error = withError ? c.req.query("error") : undefined;
  const target = `${frontendUrl}${path}`;
  return c.redirect(error ? `${target}?error=${error}` : target);
};

export interface AppEnv {
  Variables: {
    user: typeof auth.$Infer.Session.user;
    session: typeof auth.$Infer.Session.session;
  };
}

export const authGuard = createMiddleware<AppEnv>(async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session?.user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  if (!session.user.emailVerified) {
    return c.json({ error: "Email not verified" }, 403);
  }

  c.set("user", session.user);
  c.set("session", session.session);
  await next();
});

const app = new OpenAPIHono<AppEnv>({
  defaultHook: (result, c) => {
    if (!result.success) {
      return c.json({ error: "Invalid data" }, 400);
    }
  },
})

  /**
   * These elements are deprecated — do not modify directly!
   */
  // Redirects after Better Auth email verification → frontend.
  // Single handler factory: paths mirror the frontend router.
  .get("/login", authRedirect("/login", true))
  .get("/onboarding", authRedirect("/onboarding", true))
  .get("/", authRedirect("/", false))
  .basePath("/api/v1")
  .use("*", httpLogger())
  .use("*", securityAlert())
  .use(
    "*",
    cors({
      origin: allowedOrigin,
      allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowHeaders: ["Content-Type", "Authorization"],
      exposeHeaders: [
        "Content-Length",
        "X-RateLimit-Limit",
        "X-RateLimit-Remaining",
        "X-RateLimit-Reset",
        "Retry-After",
      ],
      credentials: true,
      maxAge: 86400,
    }),
  )
  .use("*", compress())
  .use("*", secureHeaders())
  // In production, hide Zod error details
  .onError((err, c) => {
    if (err.message?.includes("ZodError")) {
      return c.json({ error: "Invalid data" }, 400);
    }
    return c.json({ error: "Internal error" }, 500);
  })
  // Session auth — centralized guard on business routes
  .use("/kanban/*", authGuard)
  .use("/projects/*", authGuard)
  .use("/workspaces/*", authGuard)
  // Per-user quota on business routes (after guard: user is known)
  .use("/kanban/*", apiRateLimit())
  .use("/projects/*", apiRateLimit())
  .use("/workspaces/*", apiRateLimit())
  .use("*", async (c, next) => {
    const method = c.req.method;
    if (["POST", "PATCH"].includes(method)) {
      const contentLength = Number(c.req.header("content-length") || 0);
      if (contentLength === 0) {
        return c.json({ error: "Body requis" }, 400);
      }
      const contentType = c.req.header("content-type");
      if (!contentType?.includes("application/json")) {
        return c.json({ error: "Content-Type must be application/json" }, 415);
      }
    }
    await next();
  })
  // Better Auth handler
  .all("/auth/*", (c) => auth.handler(c.req.raw))

  // 7. Business routes
  .route("/kanban", kanbanModule)
  .route("/projects", projectsModule)
  .route("/workspaces", workspacesModule);

export type AppType = typeof app;
export default app;
