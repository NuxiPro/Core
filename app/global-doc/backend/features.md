# Features

## Auth (`auth/auth.ts`, tables `user`/`session`/`account`/`verification`)

- Email + password, magic-link (email via Loops), Google and GitHub OAuth.
- Email verification expires after 1 hour, auto sign-in after verification, redirects to `/onboarding`.
- Default role is `workspaceOwner`. Roles `admin` / `workspaceOwner` / `restricted` are defined in `auth/permissions.ts`.
- Rate limit 20 requests / 2 min. Deleting a user cascades to sessions + accounts. Details in `auth.md`.
- Note: the `organization` plugin is imported but not registered. Human decision needed: register it or remove the import.

## Tasks (`routes/matrice/`)

- Scoped per project: creation takes `{projectId}`, list requires `projectId` in query.
- Detail loads one task by ID. Update edits title/description only; moving is a separate endpoint.
- Move (`updateTaskPosition`) takes `{ colId, overTaskId, insertBefore }`. The server validates ownership, resolves neighbors and computes the new position. Never let the client send positions.

## Projects (`routes/projects/`)

- List, create, delete, plus `GET /{projectId}/board` which returns the project and all its tasks in one call (used by the kanban page).
- Projects belong to a workspace (`workspaceId`) and have a unique slug per user.

## Workspaces (`routes/workspace/`)

- List, create, get by ID. A user with no workspace is sent to onboarding by the frontend.

## Archive (status: in devellopements)

- `routes/archive/` holds only `ArchiveTask.md`. No controllers, nothing mounted in `src/index.ts`. The frontend has an archive page, but the backend has no archive endpoints yet. Human decision needed.

## Cron (`lib/`)

- `Bun.cron` runs `purge-users` every 2 days at 06:00: deletes users with `emailVerified=false` older than 2 days, in batches of 500 with 1s pause, guarded against overlapping runs. Removed on shutdown.
- Chain: `CronCenter.ts` registers → `cron-handler.ts` dispatches `scheduled()` → `cron/purge-users.ts` does the work. Never delete these files or the `user_cron_cleanup_idx` index.

## Logging (open point)

- `server.ts` uses the shared logger from `packages/shared/utils/logger`, but `src/logique/logging/logger.ts` still exists and `drizzle/connection` imports from it. Human decision needed: one logger or two.
