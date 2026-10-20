// backend/src/config/index.ts
import { COLUMNS, type ColumnId } from "@shared/config";

/**
 * Converts a ColumnId (string) to a sqlId (number) for PostgreSQL.
 * Derived from COLUMNS — automatically kept in sync whenever a column is added.
 *
 * @param col - "urgent" | "planned" | "other"
 * @returns The corresponding sqlId in COLUMNS
 * @throws If col does not exist in COLUMNS
 */
export const getColumnId = (col: ColumnId): number => {
  if (Object.hasOwn(COLUMNS, col)) {
    return COLUMNS[col as keyof typeof COLUMNS].sqlId;
  }
  throw new Error(`Colonne inconnue : ${col}`);
};

// Prebuilt map for O(1) lookup instead of Object.find() O(n)
export const sqlIdToColId = new Map<number, ColumnId>(
  Object.entries(COLUMNS).map(([id, cfg]) => [cfg.sqlId, id as ColumnId]),
);

export const getColIdFromSqlId = (sqlId: number): ColumnId => {
  const colId = sqlIdToColId.get(sqlId);
  if (!colId) throw new Error(`sqlId inconnu : ${sqlId}`);
  return colId;
};
