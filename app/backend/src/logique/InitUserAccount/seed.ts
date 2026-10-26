// EXEMPLE — 02 : l'orchestrateur. Destination : `app/backend/src/onboarding/seed.ts`.
// L'ordre du code EST l'orchestration — pas de queue, pas de table de statuts.
// Chaque ensure* est idempotent : rejoué 10× → même état final.

import { ensureDefaultSettings } from "./01-ensure-default-settings";
import { ensureStarterProject } from "./02-ensure-starter-project";
import { ensureStarterTasks } from "./03-ensure-starter-tasks";

export async function seedAccountDefaults(user: {
  id: string;
  email: string;
}) {
  // Étape 1 — settings par défaut. Indépendant du projet.
  // allSettled : un échec ici ne bloque pas le projet ni les tâches.
  await Promise.allSettled([ensureDefaultSettings(user)]);

  // Étape 2 — le projet starter. Les tâches dépendent de son `id` → on ATTEND.
  const project = await ensureStarterProject(user);

  // Étape 3 — les tâches, seulement maintenant (elles reçoivent le projet
  // en paramètre : impossible de créer des tâches orphelines, même en race).
  await ensureStarterTasks(project);
}
