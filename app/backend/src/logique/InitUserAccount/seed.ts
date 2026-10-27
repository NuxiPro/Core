import { StepDefaultSettings } from "./01-ensure-default-settings";

export async function seedAccountDefaults(user: { id: string; email: string }) {
  // Étape settings — aucune dépendance au workspace, donc lancée dans
  // user.create.after. Pas de projet ni de tâches ici : projects.workspace_id
  // est NOT NULL et le workspace n'existe pas encore à ce stade.
  // Le projet appartient à l'utilisateur : il le crée via le wizard.
  await Promise.allSettled([StepDefaultSettings(user)]);
}
