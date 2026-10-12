import { createMiddleware } from "hono/factory";
import { roles_center, Role } from "../auth/permissions";

export const requirePermission = (permission: Record<string, string[]>) =>
  createMiddleware(async (c, next) => {
    const sessionUser = c.get("user");

    if (!sessionUser) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Récupération du rôle correspondant
    const userRole = roles_center[sessionUser.role as Role];

    // Vérification instantanée en mémoire
    if (!userRole || !userRole.authorize(permission).success) {
      return c.json({ error: "Access denied" }, 403);
    }

    await next();
  });
