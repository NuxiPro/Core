import { pool } from "./src/drizzle/connection/index";
import app from "./src/index";
import CronCenter from "./src/lib/CronCenter";
import { createLogger } from "../../packages/shared/utils/logger";
import Bun from "bun";

const log = createLogger("server");

const server = Bun.serve({
  port: Number(process.env.PORT) || 8080,
  fetch: app.fetch,
});

log.info(`Server online at http://localhost:${server.port}`);

// ─── Graceful shutdown ───────────────────────────────────────
const gracefulShutdown = async (signal: string) => {
  log.warn(`Signal ${signal} received — graceful shutdown in progress`);

  // Safety timeout to avoid hanging forever
  const forceExitTimeout = setTimeout(() => {
    log.error("Forced shutdown after 10s timeout");
    process.exit(1);
  }, 10000);

  try {
    // 1. Stop the Bun server first (wait for in-flight HTTP requests)
    await server.stop(false);
    log.info("Bun no longer accepts new HTTP requests");

    // 2. Stop background tasks (Cron)
    try {
      CronCenter.stop();
      log.info("Cron tasks stopped");
    } catch (error) {
      log.error("Failed to stop CronCenter", error);
    }

    // 3. Last, close the database once nobody needs it
    try {
      await pool.end();
      log.info("PostgreSQL pool closed cleanly");
    } catch (error) {
      log.error("Failed to close PostgreSQL pool", error);
    }

    log.info("Server fully shut down.");
  } finally {
    clearTimeout(forceExitTimeout);
    process.exit(0);
  }
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

export default server;
