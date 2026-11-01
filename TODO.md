# TODO

## Backend

- Migrer loops vers Plunk (migration en cours, non terminée).
- Redis (anticipation, pas de besoin actuel) : seulement si p95 requêtes
  monte ou pool DB saturé — via `secondaryStorage` better-auth
  (sessions + rate-limits), les tokens magic-link restent en DB.

---

- [] Ajouter une zone dédier pour les email non vérifier
- [] Ajouter option personaliser l'archivage donc l'user personalise sont archive comme il veut mais surtout il va aussi avoir un mini fenête qui l'aide à personaliser sont archivage de tâche
