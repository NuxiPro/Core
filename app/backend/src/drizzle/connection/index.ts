import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { createLogger } from "../../logique/logging/logger";

const log = createLogger("db");

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 2000,
});

pool.on("error", (err: Error & { code?: string }) => {
  log.error("Pool error", { message: err.message, code: err.code });
});

pool
  .connect()
  .then((client) => {
    log.info("DB connection OK");
    client.release();
  })
  .catch((err: unknown) => {
    if (err instanceof Error) {
      log.error("DB connection FAIL", { message: err.message });
    } else {
      // Si c'est un format bizarre (un string ou autre), on le convertit proprement
      log.error("DB connection FAIL", { message: String(err) });
    }
  });

export const db = drizzle(pool);
