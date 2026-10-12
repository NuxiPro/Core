import { user } from "@backend/src/drizzle/schemas/auth-schema";
import { createLogger } from "@backend/src/logique/logging/logger";
import { and, eq, inArray, lt } from "drizzle-orm";
import { db } from "../../drizzle/connection/index";

const log = createLogger("purge-user/");
let isPurgeRunning = false;

export async function purgeUnverifiedUsers() {
  if (isPurgeRunning) {
    log.warn("Purge déjà en cours — skip");
    return;
  }
  isPurgeRunning = true;

  const LIMIT = 500;
  const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

  log.info("Purge des utilisateurs non vérifiés (>2j) démarrée");

  try {
    while (true) {
      const targets = await db
        .select({ id: user.id })
        .from(user)
        .where(and(eq(user.emailVerified, false), lt(user.createdAt, twoDaysAgo)))
        .limit(LIMIT);

      if (targets.length === 0) {
        log.info("Aucun utilisateur à purger");
        break;
      }

      const ids = targets.map((u) => u.id);
      log.info(`Suppression de ${ids.length} utilisateurs`);
      await db.delete(user).where(inArray(user.id, ids));

      if (targets.length < LIMIT) break;
      await new Promise((r) => setTimeout(r, 1000));
    }
    log.info("Purge terminée");
  } catch (error) {
    log.error("Erreur purge utilisateurs", error);
  } finally {
    isPurgeRunning = false;
  }
}
