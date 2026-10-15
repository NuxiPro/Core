# TODO — missing routes

## Projects
- [ ] `PATCH /projects/:id` (`updateProject.ts`) — rename + edit description from project settings. Frontend already calls a save (`SettingsDialog` → `update-general.ts`) but the backend route does not exist.

## Workspaces
- [ ] `PATCH /workspaces/:id` — rename from settings (only create / list / get exist).
- [ ] `DELETE /workspaces/:id` — delete a workspace (only create / list / get exist).

Pattern for all three: scope by `userId`, `requirePermission`, `404` when not found, no cascade surprise (tasks cascade with their project, see `cardsTable.projectId` `onDelete: "cascade"`).

## Settings (global)
- [ ] `GET /api/v1/setting/general` + `PATCH /api/v1/setting/general` — global settings (language, timezone, notifications). Frontend already calls them (`update-general.ts`), backend module does not exist.
- [ ] Fix frontend inconsistency: `$get` uses `api.v1.setting.general` but `$patch` uses `api.setting.general` (missing `/v1`).

## Archive (feature)
- [ ] Archive routes (only `ArchiveTask.md` spec exists, no code): instant archive + time-based archive, transactional move `cardsTable` → `archivedCardsTable`, unarchive (PATCH boolean), delete archived, get archived.

---

## Kanban — due date (mini-feature)
- [X] `dueDate` on tasks (nothing exists yet): schema column + zod validation + display/sort by deadline. Échéance = when the task must be done.

- [X] Ajouter le default 'user' au user name quand un user créer un compte 


- [ ] Migré le backend de loops à plunk

## Bosser le onbording du projet
- [ ] Prendre la structure de design de trello sans reprendre sa complexité

---

## Last
- [ ] Reverse proxy — only when all routes above are ready.

## Later features (not a priority — on hold)
- [ ] Due-date reminders (cron) — needs global settings first (user timezone, notification preferences, dedup, delivery channel). Due date column comes first, reminders after.
- [ ] WIP limits — cap the number of tasks per column (e.g. In Progress = 3 max), enforced on create/move.

## Security (deferred — needed when other users arrive)
- [ ] Per-user rate limit on business routes (`hono-rate-limiter`, already a dep): 400 req/min per user ID, no extended ban (alert via `securityAlert` instead). Measured: full scenario ≈ 14 req, frantic ≈ 240/min. Frontend survives 429 (optimistic rollback). Redis store when multi-instance.


---
