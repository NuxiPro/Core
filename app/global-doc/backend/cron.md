# Cron

> Never delete `src/lib/CronCenter.ts`, `cron-handler.ts` or `src/lib/cron/` — unverified-account cleanup depends on them.

## Structure

```
app/backend/src/lib/
├─ CronCenter.ts      # registers the cron (Bun.cron)
├─ cron-handler.ts    # handler called by Bun.cron
└─ cron/
   └─ purge-users.ts  # purge logic
```

## Files

### 1. `CronCenter.ts`

Scheduler entry point.

```ts
const CronCenter = await Bun.cron("./cron-handler.ts", "0 6 */2 * *", "purge-users")
```

- `0 6 */2 * *` = every 2 days at 06:00
- Name `purge-users` is used by `server.ts` for `Bun.cron.remove("purge-users")` on shutdown
- Imported in `server.ts` at boot — without this import the cron never registers

### 2. `cron-handler.ts`

Adapter between Bun.cron and the business logic. Must export `default { scheduled() }`.

```ts
import { purgeUnverifiedUsers } from "./cron/purge-users"
export default { async scheduled() { await purgeUnverifiedUsers() } }
```

Bun calls `scheduled()` on every tick. No logic here, only dispatch.

### 3. `cron/purge-users.ts`

Deletes `user` rows with `emailVerified=false` older than 2 days.

- Index used: `user_cron_cleanup_idx(emailVerified, createdAt)`
- Threshold: `twoDaysAgo = Date.now() - 2*24*60*60*1000`
- Loop `LIMIT 500` + `await sleep(1000)` to avoid overloading the DB
- `isPurgeRunning` lock to prevent 2 overlapping runs
- Logs via `createLogger("purge-user/")`

Verification links expire after 1 hour (`emailVerification.expiresIn: 3600`); retention is 2 days.

## Flow

```
Bun.serve (server.ts) -> import CronCenter -> Bun.cron registers purge-users
-> every 2d at 06:00 -> cron-handler.scheduled() -> purgeUnverifiedUsers()
-> SELECT ... WHERE emailVerified=false AND createdAt < 2d LIMIT 500
-> DELETE ... WHERE id IN (...)
-> repeat until 0 results
-> shutdown: Bun.cron.remove("purge-users")
```

## Add a new cron

1. Create `src/lib/cron/my-task.ts` with `export async function myTask()`
2. Add a handler in `cron-handler.ts` or create a second `Bun.cron` in `CronCenter.ts`
3. Register it in `CronCenter.ts` with a unique name
4. Add `Bun.cron.remove("my-name")` in `server.ts` graceful shutdown

## Never delete

- `CronCenter.ts`: without it no cron runs
- `cron-handler.ts`: Bun.cron points to it by relative path
- `cron/purge-users.ts`: without it ghost accounts pile up and `user` grows forever
- The `user_cron_cleanup_idx` index in `auth-schema.ts`
