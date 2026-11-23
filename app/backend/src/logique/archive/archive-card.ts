import { db } from "@backend/src/drizzle/connection";
import { userSetting } from "@backend/src/drizzle/schemas";
import {
  archivedCardsTable,
  cardsTable,
} from "@backend/src/drizzle/schemas/workspace";
import { uuid } from "@backend/utils/uuid";
import { and, eq } from "drizzle-orm";

/**
 * Moves a card from the board to the archive, in a single transaction.
 * Returns null when the card doesn't exist or isn't the user's.
 *
 * Every archiving path shares this one function: the explicit archive
 * route, the instant-mode drop into Done, and the time-based sweep when
 * it lands. Keep it here, not in the controllers.
 */
export async function archiveCard(
  taskId: string,
  userId: string,
  projectId?: string,
) {
  return db.transaction(async (tx) => {
    // The card must exist and belong to this user (and this project,
    // when the caller knows it).
    const [card] = await tx
      .select()
      .from(cardsTable)
      .where(
        and(
          eq(cardsTable.id, taskId),
          eq(cardsTable.userId, userId),
          ...(projectId ? [eq(cardsTable.projectId, projectId)] : []),
        ),
      );
    if (!card) return null;

    // Insert the archive row, then delete the card — same transaction,
    // so a task is never in both tables or in neither.
    const [row] = await tx
      .insert(archivedCardsTable)
      .values({
        id: uuid(),
        taskId: card.id,
        userId: card.userId,
        projectId: card.projectId,
        title: card.title,
        description: card.description,
        quadrant: card.quadrant,
        priorityLabel: card.priorityLabel,
        dueDate: card.dueDate,
        createdAt: card.createdAt,
        archivedAt: new Date(),
      })
      .returning();

    await tx.delete(cardsTable).where(eq(cardsTable.id, card.id));
    return row;
  });
}

/**
 * The user's archive preference, read straight from the DB — the client
 * never gets to decide this. No settings row yet = "instant" default,
 * same as the column default.
 */
export async function getArchiveMode(
  userId: string,
): Promise<"instant" | "time"> {
  const [row] = await db
    .select({ archiveMode: userSetting.archiveMode })
    .from(userSetting)
    .where(eq(userSetting.userId, userId))
    .limit(1);
  return row?.archiveMode ?? "instant";
}
