// packages/config/index-frontend.ts
import { COLUMNS, type ColumnId } from "./index";

/**
 * Converts a sqlId (number) to a ColumnId (string).
 * Inverse of getColumnId — used by the backend before sending to the frontend.
 * Derived from COLUMNS, so never out of sync.
 */
export const SQL_ID_MAP: Record<number, ColumnId> = Object.fromEntries(
  Object.entries(COLUMNS).map(([key, val]) => [val.sqlId, key as ColumnId]),
) as Record<number, ColumnId>;

/**
 * Exhaustive list of valid ColumnIds.
 * Typed tuple to guarantee it is never empty.
 */
export const COLUMN_IDS = Object.keys(COLUMNS) as [ColumnId, ...ColumnId[]];
