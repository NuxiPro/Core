// EXEMPLE — 05 : les tâches du starter. JSON = CONTENU, UUID = généré à l'insert.
// Destination : `app/backend/src/onboarding/`. Idempotent : no-op si le projet
// a déjà au moins une tâche (ou count check / unique (projectId, position)).

import starterData from "./starter-tasks.json";

// Si tu utilises Bun, crypto.randomUUID() est dispo partout ; sinon uuid v4.
const newId = () => crypto.randomUUID();

type StarterProject = { id: string };

export async function ensureStarterTasks(project: StarterProject) {
  // [ADAPTER] 1) check idempotent :
  //   const [row] = await db.select({ count: sql<number>`count(*)` })
  //     .from(tasks).where(eq(tasks.projectId, project.id));
  //   if (row.count > 0) return;

  // [ADAPTER] 2) l'insert : le JSON fournit le contenu, PAS les identifiants.
  //   await db.insert(tasks).values(
  //     starterData.tasks.map((t, index) => ({
  //       id: newId(),                  // ← UUID frais par compte, jamais dans le JSON
  //       projectId: project.id,        // ← l'association vit dans le code
  //       position: index,              // ← l'ordre vient de l'index du JSON
  //       title: t.title,
  //       dueDate: null,
  //     })),
  //   );

  // Règles :
  // - ne mets JAMAIS d'UUID pré-écrit, "0000…" ou "dev-…" dans le JSON : deux
  //   comptes se partageraient les mêmes PKs, et tes checks idempotents se
  //   « croiraient » déjà exécutés → re-seed silencieux impossible à débugger
  // - un jour, une variante locale : filtre par langue si besoin — mais la
  //   valeur sert de CLÉ de variante, pas de texte injecté.
}
