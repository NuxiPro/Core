import { CRONS } from "./cron";
import { createLogger } from "../logique/logging/logger";
import Bun from "bun";

const log = createLogger("/CronJob");

const jobs = CRONS.map(({ name, schedule, task }) => {
  const job = Bun.cron(schedule, async () => {
    try {
      await task();
    } catch (error) {
      log.error(`Error in ${name}`, error);
    }
  });
  log.info(`Cron registered: ${name} (${schedule})`);
  return job;
});

export const CronCenter = {
  stop: () => jobs.forEach((job) => job.stop()),
};
