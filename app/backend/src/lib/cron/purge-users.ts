import { user } from "@backend/src/drizzle/schemas/auth-schema";
import { createLogger } from "@backend/src/logique/logging/logger";
import { and, eq, inArray, lt } from "drizzle-orm";
import { db } from "../../drizzle/connection/index";

const log = createLogger("purge-user/");
let isPurgeRunning = false;

export async function purgeUnverifiedUsers() {
  if (isPurgeRunning) {
    log.warn("Purge already running — skip");
    return;
  }
  isPurgeRunning = true;

  const LIMIT = 500;
  const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

  log.info("Purge of unverified users (>2d) started");

  try {
    while (true) {
      const targets = await db
        .select({ id: user.id })
        .from(user)
        .where(and(eq(user.emailVerified, false), lt(user.createdAt, twoDaysAgo)))
        .limit(LIMIT);

      if (targets.length === 0) {
        log.info("No users to purge");
        break;
      }

      const ids = targets.map((u) => u.id);
      log.info(`Deleting ${ids.length} users`);
      await db.delete(user).where(inArray(user.id, ids));

      if (targets.length < LIMIT) break;
      await new Promise((r) => setTimeout(r, 1000));
    }
    log.info("Purge completed");
  } catch (error) {
    log.error("User purge error", error);
  } finally {
    isPurgeRunning = false;
  }
}
