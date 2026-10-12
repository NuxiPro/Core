# Data flow

## Client → server (overview)

```
Browser (React)
  │  TanStack Query hook  (e.g. useTasks)
  │  → api function  (e.g. getBoard)
  │  → Hono client hc<AppType>  (typed, cookies included)
  ▼  HTTP JSON
Server (Bun/Hono /api/v1)
  │  middlewares → authGuard (401/403)
  │  → controller → Drizzle
  ▼  PostgreSQL
  │  JSON response (reverse path)
```

## Request checkpoints

Every request passes 5 checkpoints, in order:

1. **Timer starts** — `httpLogger` notes the method + path and starts the clock.
2. **Network guards** — CORS (origin allowed?) → `compress` → security headers.
3. **Body guard** — POST/PATCH only: empty body → 400, non-JSON → 415.
4. **Auth guard** — `/matrice/*`, `/projects/*`, `/workspaces/*` only: no session → 401, email not verified → 403. (`/auth/*` skips this step.)
5. **Handler** — better-auth handler or module controller → Drizzle → PostgreSQL → JSON response.

When the response is ready, `httpLogger` writes exactly one line:

```
PATCH /api/v1/matrice/updateTask/abc → 200 (12ms)
```

- 2xx/3xx → `info` (green, dev only)
- 4xx → `warn` (yellow, always shown)
- 5xx → `error` (red, always shown)

So in production you only see warnings and errors; successes are silent.

## 1. Entry (`server.ts` + `src/index.ts`)

- `Bun.serve` on `PORT` (default 8080). TLS in dev only. Shutdown order: HTTP server → cron → pg pool.
- `FRONTEND_URL_ALLOWED` is required at boot (throws if missing). No `.env` values are documented here.
- `AppType` is inferred from the app and exported. The frontend imports it for type-safe calls. Never hand-edit it.

## 2. Auth guard

- `/auth/*` goes straight to the better-auth handler (no guard).
- `/matrice/*`, `/projects/*`, `/workspaces/*` go through `authGuard`: 401 when unauthenticated, 403 when email is not verified.
- better-auth itself is rate-limited (20 requests / 2 min).

## 3. Routes (one pattern everywhere)

Each module follows: `controler/*.ts` (logic) + `*.router.ts` (OpenAPI route definitions) + `*.schemas.ts` (Zod input/output).

- `matrice`: `POST /{projectId}/newTask`, `GET /getTask?projectId&limit&offset`, `GET /getTask/{id}`, `PATCH /updateTask/{id}`, `PATCH /updateTaskPosition/{id}`, `DELETE /deletedTask/{id}`
- `projects`: `GET /`, `POST /newProjects`, `GET /{projectId}/board` (project + tasks in one call), `DELETE /deletedProject/{id}`
- `workspaces`: `GET /`, `POST /NewWorkspace`, `GET /{id}`

## 4. Database

- Single `pg` Pool (max 10) + one Drizzle `db` instance in `drizzle/connection/index.ts`. Never create another pool.
- Tables: `user`, `session`, `account`, `verification` (auth) + `workspace`, `projects`, `cards`, `archived_cards` + `user_preference`, `user_consent`.
- `quadrant` stores an integer; conversion always goes through `src/config/index.ts`.
- Task order uses fractional-index positions scoped per user/project/column; the server computes positions, the client only says where it dropped.
