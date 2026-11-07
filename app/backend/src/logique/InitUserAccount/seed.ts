import { StepDefaultSettings, type Lang } from "./01-ensure-default-settings";
import { createLogger } from "../logging/logger";

export async function seedAccountDefaults(user: { id: string; email: string, language?: Lang }) {
  // Étape settings — aucune dépendance au workspace, donc lancée dans
  // user.create.after. Pas de projet ni de tâches ici : projects.workspace_id
  // est NOT NULL et le workspace n'existe pas encore à ce stade.
  // Le projet appartient à l'utilisateur : il le crée via le wizard.
  const log = createLogger("init user account")
  log.info("Start init user account")
  await Promise.allSettled([StepDefaultSettings(user)]);
}
