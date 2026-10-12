import { createLogger } from "../logique/logging/logger";
import { purgeUnverifiedUsers } from "./cron/purge-users";

const log = createLogger("/CronJob");
const CronCenter = Bun.cron("0 6 */2 * *", async () => {
  try {
    await purgeUnverifiedUsers();
  } catch (error) {
    log.error("Erreur dans purge-users", error);
  }
});
log.info("Cron enregistré: purge-users (0 6 */2 * *)");

export default CronCenter;
