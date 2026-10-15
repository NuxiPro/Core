// ⚠️ ATTENTION : editing this file directly changes the project columns

// 1. First the structure (Interface)
export type ColumnConfig = {
  title: string;
  sqlId: number; // The vital link to PostgreSQL
};

// 2. Then the data (Source of Truth)
/* --- GLOBAL CONFIGURATION --- */
export const COLUMNS = {
  todo: {
    title: "To Do",
    sqlId: 1,
  },
  In_Progress: {
    title: "In Progress",
    sqlId: 2,
  },
  Done: {
    title: "Done",
    sqlId: 3,
  },
} as const satisfies Record<string, ColumnConfig>;
// "as const" freezes keys for automatic typing
// "satisfies" checks the structure without losing name precision

// 3. Finally the automatically derived types and mappings
/**
 * Automatically generates the ID union type ('todo' | 'In_Progress' | 'Done')
 * from the COLUMNS object keys.
 * Pourquoi : Avoids redefining the type manually on each column addition.
 * This is the "Single Source of Truth" (SSOT).
 */
export type ColumnId = keyof typeof COLUMNS;
