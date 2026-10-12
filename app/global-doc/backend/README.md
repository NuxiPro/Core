# Backend

API in `app/backend/`. Bun + Hono (OpenAPI) + Drizzle ORM (PostgreSQL) + better-auth. Types exported as `AppType` for the frontend Hono RPC client.

## Run

```bash
bun install
bun run dev        # watch mode, port 8080
bun run start      # production
bun run db:push    # push schema to DB (drizzle-kit)
bun run db:studio  # visual DB explorer
bun run typecheck
bun run lint
```

Entry: `server.ts` → `src/index.ts`. Base path is `/api/v1`.

## Docs

- [`structure.md`](./structure.md) — folders and where to put code
- [`data-flow.md`](./data-flow.md) — request → auth guard → route → Drizzle
- [`features.md`](./features.md) — auth, tasks, projects, workspaces, archive status, cron
- [`maintenance.md`](./maintenance.md) — rules to follow when touching the API
