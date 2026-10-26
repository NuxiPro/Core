// EXEMPLE — 04 : le projet starter, idempotent et anti double-seed.
// Destination : `app/backend/src/onboarding/` + une colonne/flag dans la migration.

export async function ensureStarterProject(user: {
  id: string;
  email: string;
}): Promise<{ id: string }> {
  // [ADAPTER] 1) cherche le projet starter existant de l'user (drizzle, paramétré) :
  //   const [row] = await db.select({ id }).from(projects)
  //     .where(and(eq(projects.ownerId, user.id), eq(projects.isStarter, true)));
  //   if (row) return row;                       // ← no-op : déjà seedé
  //
  // [ADAPTER] 2) sinon INSERT → retourne l'id généré :
  //   const [created] = await db.insert(projects).values({
  //     id: uuid(),          // ← UUID généré ICI, jamais pré-écrit dans un JSON
  //     ownerId: user.id,
  //     isStarter: true,     // ← flag dans la table (colonne à ajouter à la migration)
  //     name: "Premier projet",
  //   }).returning({ id: projects.id });
  //   return created;
  //
  // ANTI DOUBLE-SEED (race condition : 2 requêtes créent l'user en parallèle) :
  //   contrainte UNIQUE en base — ex. unique index (owner_id) WHERE is_starter
  //   (ou onConflictDoNothing) → le doublon est refusé, pas seulement espéré.
  //
  // Pourquoi l'attente (`await`) compte : l'étape 3 reçoit CET id en paramètre.
  // La dépendance tâches→projet vit dans le code, pas dans un système de statuts.
  return { id: "REPLACE_WITH_INSERT_RETURNED_ID" };
}
