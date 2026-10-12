# Database connection

File: `src/drizzle/connection/index.ts`. Single `pg` Pool + one Drizzle `db` instance used by all routes. Never create another pool.

## Pool

| Option | Value | Why |
|---|---|---|
| `connectionString` | `DATABASE_URL` (env, never hardcoded) | format `postgres://user:pass@host:port/db` |
| `max` | `10` | beyond this, queries wait for a free connection |
| `idleTimeoutMillis` | `10000` | unused 10s connections are closed |
| `connectionTimeoutMillis` | `2000` | fail after 2s instead of waiting forever |

- `pool.on("error")` logs idle errors (dropped connections) without crashing.
- Boot self-test: `pool.connect()` logs OK/FAIL and releases the client.

## Exports

- `pool` — raw `pg` pool.
- `db` — Drizzle instance: `import { db } from "@backend/src/drizzle/connection/index"`.

## Rules

- All queries go through `db`. No direct connections elsewhere.
- Never hardcode `DATABASE_URL`.
- Never raise `max` without checking PG capacity.
