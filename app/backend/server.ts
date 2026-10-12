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

log.info(`Serveur en ligne sur http://localhost:${server.port}`);

// ─── Graceful shutdown ───────────────────────────────────────
const gracefulShutdown = async (signal: string) => {
  log.warn(`Signal ${signal} reçu — arrêt progressif en cours`);

  // Timeout de sécurité pour éviter un blocage infini
  const forceExitTimeout = setTimeout(() => {
    log.error("Arrêt forcé après timeout de 10s");
    process.exit(1);
  }, 10000);

  try {
    // 1. On arrête d'abord le serveur Bun proprement (attend la fin des requêtes HTTP en cours)
    await server.stop(false);
    log.info("Bun ne prend plus de nouvelles requêtes HTTP");

    // 2. On arrête les tâches de fond (Cron)
    try {
      CronCenter.stop();
      log.info("Tâches Cron arrêtées");
    } catch (error) {
      log.error("Échec arrêt CronCenter", error);
    }

    // 3. En dernier, on ferme la base de données une fois que plus personne n'en a besoin
    try {
      await pool.end();
      log.info("Pool PostgreSQL fermé proprement");
    } catch (error) {
      log.error("Échec fermeture pool PostgreSQL", error);
    }

    log.info("Serveur complètement éteint.");
  } finally {
    clearTimeout(forceExitTimeout);
    process.exit(0);
  }
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

export default server;
