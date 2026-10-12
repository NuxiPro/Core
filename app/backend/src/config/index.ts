// backend/src/config/index.ts
export type { ColumnConfig, ColumnId } from "@shared/config";

import { COLUMNS, type ColumnId } from "@shared/config";

export { COLUMNS };

/**
 * Convertit un ColumnId (string) en sqlId (number) pour PostgreSQL.
 * Dérivé de COLUMNS — synchronisé automatiquement à chaque ajout de colonne.
 *
 * @param col - "urgent" | "planned" | "other"
 * @returns Le sqlId correspondant dans COLUMNS
 * @throws Si col n'existe pas dans COLUMNS
 */
export const getColumnId = (col: ColumnId): number => {
  if (Object.hasOwn(COLUMNS, col)) {
    return COLUMNS[col as keyof typeof COLUMNS].sqlId;
  }
  throw new Error(`Colonne inconnue : ${col}`);
};

// Map pré-construite pour lookup O(1) au lieu de Object.find() O(n)
export const sqlIdToColId = new Map<number, ColumnId>(
  Object.entries(COLUMNS).map(([id, cfg]) => [cfg.sqlId, id as ColumnId]),
);

export const getColIdFromSqlId = (sqlId: number): ColumnId => {
  const colId = sqlIdToColId.get(sqlId);
  if (!colId) throw new Error(`sqlId inconnu : ${sqlId}`);
  return colId;
};
