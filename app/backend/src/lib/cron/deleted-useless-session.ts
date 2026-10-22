import { session } from "@backend/src/drizzle/schemas/auth-schema";
import { createLogger } from "@backend/src/logique/logging/logger";
import { inArray, lt } from "drizzle-orm";
import { db } from "../../drizzle/connection/index";

const log = createLogger("purge-session/");
let isPurgeRunning = false;


/**
 * Purges user sessions older than 30 days in batches to free up PostgreSQL storage.
 *
 * - Prevents concurrent runs using a lock flag.
 * - Deletes records in batches of 500, with a 1-second delay between batches,
 *   to avoid database I/O bottlenecks.
 *
 * @returns A promise that resolves when the purge completes or is skipped.
 */
export async function purgeExpiredSessions() {
  if (isPurgeRunning) {
    log.warn("Purge already running — skip");
    return;
  }
  isPurgeRunning = true;

  const LIMIT = 500;
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  log.info("Purge of old sessions (>30d) started");

  try {
    while (true) {
      const targets = await db
        .select({ id: session.id })
        .from(session)
        .where(lt(session.createdAt, thirtyDaysAgo))
        .limit(LIMIT);

      if (targets.length === 0) {
        log.info("No more sessions to purge");
        break;
      }

      const ids = targets.map((s) => s.id);
      log.info(`Deleting ${ids.length} sessions`);
      await db.delete(session).where(inArray(session.id, ids));

      if (targets.length < LIMIT) break;
      await new Promise((r) => setTimeout(r, 1000));
    }
    log.info("Purge completed successfully");
  } catch (error) {
    log.error("Session purge error", error);
  } finally {
    isPurgeRunning = false;
  }
}
