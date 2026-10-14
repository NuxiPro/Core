import { createMiddleware } from "hono/factory";
import { roles_center, Role } from "../permissions";

export const requirePermission = (permission: Record<string, string[]>) =>
  createMiddleware(async (c, next) => {
    const sessionUser = c.get("user");

    if (!sessionUser) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Retrieve the matching role
    const userRole = roles_center[sessionUser.role as Role];

    // Instant in-memory check
    if (!userRole || !userRole.authorize(permission).success) {
      return c.json({ error: "Access denied" }, 403);
    }

    await next();
  });
