# Maintenance rules

Verified against `app/backend/src/`. Follow these when touching the API.

## Entry and base path

- `server.ts` starts Bun on `PORT` (default 8080), TLS in dev only, graceful shutdown (server → cron → pool).
- App lives in `src/index.ts`, base path is `/api/v1` (not `/api`).
- Middleware order: `httpLogger` → CORS (`FRONTEND_URL_ALLOWED`, throws if missing) → `compress` → security headers → JSON body guard → `authGuard` on `/matrice/*`, `/projects/*`, `/workspaces/*` → `/auth/*` handler → modules.

## Auth

- `authGuard` returns 401 when unauthenticated, 403 when email is not verified.
- Never trust client input for ownership: scope queries by the session user.

## Types and IDs

- `AppType` is inferred from the app (`src/index.ts`). Never hand-edit it; the frontend consumes it directly.
- New module = `.route()` in `src/index.ts` + routes assembled in the module's own `index.ts`.
- `colId` (string) ↔ `quadrant` (integer) always goes through `getColumnId()` / `getColIdFromSqlId()` in `src/config/index.ts`.
- IDs are UUID v7 from `utils/uuid.ts` (Bun native). Never generate IDs on the client.
- Task positions use `fractional-indexing` (`buildTask` in `src/logique/column/task.ts`).
