import type { archivedCardsTable } from "@backend/src/drizzle/schemas/workspace";

// Light row for the list (step 1): no description/priority/dueDate.
// The heavy fields are fetched one by one by serializeArchived (step 2).
export function serializeArchivedLight(
  row: Pick<
    typeof archivedCardsTable.$inferSelect,
    "id" | "title" | "projectId" | "userId" | "archivedAt" | "createdAt"
  >,
) {
  return {
    id: row.id,
    title: row.title,
    projectId: row.projectId,
    userId: row.userId,
    archivedAt: row.archivedAt.toISOString(),
    createdAt: row.createdAt.toISOString(),
  };
}

// Dates as ISO strings, matching the API response schema.
// Shared by the archive and detail handlers.
export function serializeArchived(row: typeof archivedCardsTable.$inferSelect) {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? null,
    projectId: row.projectId,
    userId: row.userId,
    // Same wire names as the board API: DB priority_label -> priority,
    // dates serialized as ISO strings (JSON has no Date).
    priority: row.priorityLabel ?? null,
    dueDate: row.dueDate?.toISOString() ?? null,
    archivedAt: row.archivedAt.toISOString(),
    createdAt: row.createdAt.toISOString(),
  };
}
