/**
 * Retourne la date actuelle au format ISO 8601 strict.
 * Exemple : "2026-03-14T17:45:00.000Z"
 * Requis par Zod .datetime()
 */
export const getDbDateStr = (): string => {
  return new Date().toISOString();
};
