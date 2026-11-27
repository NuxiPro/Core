# Logging

Single source: `app/backend/src/logique/logging/logger.ts`, backed by tslog. Use the backend path below everywhere in this project.

## Usage structure (follow this in every file)

```ts
import { createLogger } from "@backend/src/logique/logging/logger";

const log = createLogger("matrice/create");

log.info("Task created", { id });
log.warn("Slow query", { ms });
log.error("DB failed", err);
log.debug("Local vars", { userId });
log.alert("Repeated security refusals", { userId, route });
```

1. Import `createLogger`.
2. Create one `const log` per file with the module name (e.g. `"matrice/create"`, `"purge-user/"`, `"http"`, `"db"`).
3. Log with `log.info` / `log.warn` / `log.error` / `log.debug` / `log.alert`.

## Levels

| Level | Dev | Prod | Use for |
|-------|-----|------|---------|
| `debug` | shown | hidden | local variables, traces |
| `info` | shown | hidden | normal events (created, done) |
| `warn` | shown | hidden | recoverable issues (4xx, skipped purge) |
| `error` | shown | shown | failures (5xx, exceptions) |
| `alert` | shown | shown | security alerts that must remain visible |

Development uses readable console output; production writes JSON lines. Sensitive fields and common secret patterns are masked by tslog.

`server.ts` explicitly enables `info` for its own logger in production, so its startup and shutdown messages remain visible without enabling routine request logs.

## `httpLogger`

Registered once (`.use("*", httpLogger())`). After each response it writes one line:

```
PATCH /api/v1/matrice/updateTask/abc → 200 (12ms)
```

2xx/3xx → `info`, 4xx → `warn`, 5xx → `error`. Production therefore retains 5xx responses; routine traffic and 4xx warnings stay development-only.
