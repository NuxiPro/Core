// packages/config/index-frontend.ts
import { COLUMNS, type ColumnId } from "./index";

/**
 * Convertit un sqlId (number) en ColumnId (string).
 * Sens inverse de getColumnId — utilisé par le backend avant d'envoyer au frontend.
 * Dérivé de COLUMNS, donc jamais désynchronisé.
 */
export const SQL_ID_MAP: Record<number, ColumnId> = Object.fromEntries(
  Object.entries(COLUMNS).map(([key, val]) => [val.sqlId, key as ColumnId]),
) as Record<number, ColumnId>;

/**
 * Liste exhaustive des ColumnId valides.
 * Tuple typé pour garantir qu'elle n'est jamais vide.
 */
export const COLUMN_IDS = Object.keys(COLUMNS) as [ColumnId, ...ColumnId[]];
