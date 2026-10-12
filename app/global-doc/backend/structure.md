# Structure

Real code lives in `app/backend/src/`.

```
src/
  index.ts             # Hono app: basePath /api/v1, middlewares, authGuard, mounts
  auth/auth.ts         # better-auth config (magic-link, Google, GitHub, rate limit)
  auth/permissions.ts  # roles: admin, workspaceOwner, restricted
  config/index.ts      # getColumnId / getColIdFromSqlId (colId string <-> quadrant int)
  drizzle/connection/index.ts  # pg Pool + Drizzle db instance
  drizzle/schemas/
    auth-schema.ts     # user, session, account, verification
    workspace.ts       # workspace, projects, cards, archived_cards
    user-center.ts     # user_preference, user_consent
  logique/column/
    task.ts            # buildTask (UUID v7 + fractional-index position)
    indexactionTaskV2.ts  # MoveTask (server-side reorder)
  logique/logging/logger.ts  # backend logger
  lib/
    CronCenter.ts      # registers purge-users cron
    cron-handler.ts    # Bun.cron entry, dispatches to cron/
    cron/purge-users.ts  # deletes unverified users older than 2 days
    openapi.ts         # shared OpenAPIHono factory
  routes/
    matrice/           # tasks: controler/ + task.router.ts + task.shemas.ts
    projects/          # controler/ (list, create, board, delete) + router + schemas
    workspace/         # controler/ (list, create, get) + router + schemas
    archive/           # doc only (ArchiveTask.md), no controllers mounted
server.ts              # Bun.serve, TLS in dev, graceful shutdown
utils/uuid.ts          # UUID v7 (Bun native)
utils/dateHelpers.ts   # ISO date helpers
utils/helpers/email/   # email sending (Loops)
```

Rule: new resource = new folder under `routes/` with `controler/` + `*.router.ts` + `*.schemas.ts`, assembled in its `index.ts`, mounted with `.route()` in `src/index.ts`. Never put route logic elsewhere.
