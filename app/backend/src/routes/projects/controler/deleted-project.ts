import { db } from "@backend/src/drizzle/connection";
import { projectsTable } from "@backend/src/drizzle/schemas";
import { createOpenAPIHono } from "@backend/src/lib/openapi";
import { createLogger } from "@backend/src/logique/logging/logger";
import { and, eq } from "drizzle-orm";
import { DeletedProjectRoute } from "../projects.router";

const log = createLogger("Project/deleted-project");

const app = createOpenAPIHono().openapi(DeletedProjectRoute, async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ message: "Non authentifié" }, 401);
  }

  try {
    const { id } = c.req.valid("param");

    const deleted = await db
      .delete(projectsTable)
      .where(and(eq(projectsTable.id, id), eq(projectsTable.userId, user.id)))
      .returning({ id: projectsTable.id });

    if (deleted.length === 0) {
      return c.json(
        { message: "projects introuvable ou accès non autorisé" },
        404,
      );
    }
    return c.json({ success: true }, 200);
  } catch (err) {
    log.error(
      "[DELETED /deletedProject] Erreur de suppression  de projects",
      err,
    );
    return c.json({ message: "Erreur server" }, 500);
  }
});

export default app;
