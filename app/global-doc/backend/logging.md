# Logging

Single source: `packages/shared/utils/logger`. `src/logique/logging/logger.ts` re-exports it and adds `httpLogger`. Use the backend path below everywhere in this project.

## Usage structure (follow this in every file)

```ts
import { createLogger } from "@backend/src/logique/logging/logger";

const log = createLogger("matrice/create");

log.info("Task created", { id });
log.warn("Slow query", { ms });
log.error("DB failed", err);
log.debug("Local vars", { userId });
```

1. Import `createLogger`.
2. Create one `const log` per file with the module name (e.g. `"matrice/create"`, `"purge-user/"`, `"http"`, `"db"`).
3. Log with `log.info` / `log.warn` / `log.error` / `log.debug`.

## Levels

| Level | Dev | Prod | Use for |
|-------|-----|------|---------|
| `debug` | shown | hidden | local variables, traces |
| `info` | shown | hidden | normal events (created, done) |
| `warn` | shown | shown | recoverable issues (4xx, skipped purge) |
| `error` | shown | shown | failures (5xx, exceptions) |

Format: `[timestamp] LEVEL [context] message` + JSON extra or stack for `Error`. Colors: gray/cyan/yellow/red.

## `httpLogger`

Registered once (`.use("*", httpLogger())`). After each response it writes one line:

```
PATCH /api/v1/matrice/updateTask/abc → 200 (12ms)
```

2xx/3xx → `info`, 4xx → `warn`, 5xx → `error`. So production logs contain only warnings and errors.
