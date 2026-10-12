// ⚠️ ATTENTION : Si tu modifies ce fichier, tu modifies directement les colonne du projet

// 1. D'abord la structure (Interface)
export type ColumnConfig = {
  title: string;
  sqlId: number; // Le lien vital avec PostgreSQL
};

// 2. Ensuite les données (Source de Vérité)
/* --- CONFIGURATION GLOBALE --- */
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
// "as const" fige les clés pour le typage automatique
// "satisfies" vérifie la structure sans perdre la précision des noms

// 3. Enfin les types et mappings dérivés automatiquement
/**
 * Génère automatiquement l'Union Type des IDs ('todo' | 'In_Progress' | 'Done')
 * à partir des clés de l'objet COLUMNS.
 * Pourquoi : Évite de redéfinir manuellement le type à chaque ajout de colonne.
 * C'est ta "Source Unique de Vérité" (SSOT).
 */
export type ColumnId = keyof typeof COLUMNS;
