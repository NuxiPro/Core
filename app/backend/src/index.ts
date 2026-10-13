import { kanbanModule } from "@backend/src/routes/kanban/index";
import { OpenAPIHono } from "@hono/zod-openapi";
import { compress } from "hono/compress";
import { cors } from "hono/cors";
import { createMiddleware } from "hono/factory";
import { auth } from "./auth";
import { httpLogger } from "./logique/logging/logger";
import { projectsModule } from "./routes/projects";
import { workspacesModule } from "./routes/workspace";

const allowedOrigin = process.env.FRONTEND_URL_ALLOWED;
if (!allowedOrigin) {
  throw new Error("FRONTEND_URL_ALLOWED is not defined in .env");
}

const frontendUrl = allowedOrigin.split(",")[0];

export interface AppEnv {
  Variables: {
    user: typeof auth.$Infer.Session.user;
    session: typeof auth.$Infer.Session.session;
  };
}

export const authGuard = createMiddleware<AppEnv>(async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session?.user) {
    return c.json({ error: "Non authentifié" }, 401);
  }

  if (!session.user.emailVerified) {
    return c.json({ error: "Email non vérifié" }, 403);
  }

  c.set("user", session.user);
  c.set("session", session.session);
  await next();
});

const app = new OpenAPIHono<AppEnv>({
  defaultHook: (result, c) => {
    if (!result.success) {
      return c.json({ error: "Données invalides" }, 400);
    }
  },
})

  /**
   * Cette éléments et à modifier directement car obsolète !
   */
  // Redirects après vérification email Better Auth → frontend
  .get("/login", (c) => {
    const error = c.req.query("error");
    const redirectUrl = error
      ? `${frontendUrl}/login?error=${error}`
      : `${frontendUrl}/login`;
    return c.redirect(redirectUrl);
  })
  .get("/onboarding", (c) => {
    const error = c.req.query("error");
    const redirectUrl = error
      ? `${frontendUrl}/onboarding?error=${error}`
      : `${frontendUrl}/onboarding`;
    return c.redirect(redirectUrl);
  })
  .get("/", (c) => {
    return c.redirect(frontendUrl as string);
  })
  .basePath("/api/v1")
  .use("*", httpLogger())
  .use(
    "*",
    cors({
      origin: allowedOrigin,
      allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowHeaders: ["Content-Type", "Authorization"],
      exposeHeaders: ["Content-Length"],
      credentials: true,
      maxAge: 86400,
    }),
  )
  .use("*", compress())
  .use("*", async (c, next) => {
    await next();
    c.header("X-Frame-Options", "DENY");
    c.header("X-Content-Type-Options", "nosniff");
    c.header(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains",
    );
    c.header("Referrer-Policy", "strict-origin-when-cross-origin");
    c.header("X-XSS-Protection", "0");
    c.header("Content-Security-Policy", "default-src 'self'");
  })
  // En production, masquer les détails d'erreur Zod
  .onError((err, c) => {
    if (err.message?.includes("ZodError")) {
      return c.json({ error: "Données invalides" }, 400);
    }
    return c.json({ error: "Erreur interne" }, 500);
  })
  // Session auth — guard centralisé sur les routes métier
  .use("/kanban/*", authGuard)
  .use("/projects/*", authGuard)
  .use("/workspaces/*", authGuard)
  .use("*", async (c, next) => {
    const method = c.req.method;
    if (["POST", "PATCH"].includes(method)) {
      const contentLength = Number(c.req.header("content-length") || 0);
      if (contentLength === 0) {
        return c.json({ error: "Body requis" }, 400);
      }
      const contentType = c.req.header("content-type");
      if (!contentType?.includes("application/json")) {
        return c.json(
          { error: "Content-Type doit être application/json" },
          415,
        );
      }
    }
    await next();
  })
  // Better Auth handler
  .all("/auth/*", (c) => auth.handler(c.req.raw))

  // 7. Routes métier
  .route("/kanban", kanbanModule)
  .route("/projects", projectsModule)
  .route("/workspaces", workspacesModule);

export type AppType = typeof app;
export default app;
