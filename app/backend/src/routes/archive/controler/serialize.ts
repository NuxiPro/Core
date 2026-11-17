import type { archivedCardsTable } from "@backend/src/drizzle/schemas/workspace";

// Dates as ISO strings, matching the API response schema.
// Shared by the archive and list handlers.
export function serializeArchived(row: typeof archivedCardsTable.$inferSelect) {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? null,
    projectId: row.projectId,
    userId: row.userId,
    archivedAt: row.archivedAt.toISOString(),
    createdAt: row.createdAt.toISOString(),
  };
}
