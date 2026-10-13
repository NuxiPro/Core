# TODO

## Backend

- Migrer loops vers Plunk (migration en cours, non terminée).
- Redis (anticipation, pas de besoin actuel) : seulement si p95 requêtes
  monte ou pool DB saturé — via `secondaryStorage` better-auth
  (sessions + rate-limits), les tokens magic-link restent en DB.
