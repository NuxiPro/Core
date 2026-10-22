import { purgeUnverifiedUsers } from "./purge-users";
import { purgeExpiredSessions } from "./deleted-useless-session";

/**
 * Registre des crons — le seul endroit à éditer pour ajouter un job.
 * CronCenter lit cette liste : schedule + log + try/catch sont appliqués
 * automatiquement (une source unique, zéro drift doc/réalité).
 */
export const CRONS = [
  { name: "purge-users",            schedule: "0 6 */2 * *", task: purgeUnverifiedUsers },
  { name: "purge-expired-sessions", schedule: "0 6 1 * *",   task: purgeExpiredSessions },
] as const;
