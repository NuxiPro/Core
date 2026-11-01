import type { auth } from "@backend/src/auth";

// Environnement Hono typé (Variables injectées par authGuard dans app/backend/src/index.ts).
// Fichier dédié pour couper la dépendance de types index.ts ↔ modules (sinon le merge hono dégénère).
export interface AppEnv {
  Variables: {
    user: typeof auth.$Infer.Session.user;
    session: typeof auth.$Infer.Session.session;
  };
}
