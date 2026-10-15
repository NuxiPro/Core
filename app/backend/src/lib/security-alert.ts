import { createLogger } from "@packages/shared/utils/logger";
import type { MiddlewareHandler } from "hono";
import { RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS } from "./rate-limit-config";

const log = createLogger("security");

// Alert when refusals (403/429) stack up to the global rate-limit budget:
// whoever hits the limiter repeatedly gets one log line (OpenObserve picks it up).
const WINDOW_MS = RATE_LIMIT_WINDOW_MS;
const THRESHOLD = RATE_LIMIT_MAX;
const MAX_KEYS = 1000;

const hits = new Map<string, { count: number; resetAt: number; alerted: boolean }>();

function sweep(now: number): void {
  if (hits.size <= MAX_KEYS) return;
  for (const [key, entry] of hits) {
    if (now > entry.resetAt) hits.delete(key);
  }
}

export function securityAlert(): MiddlewareHandler {
  return async (c, next) => {
    await next();

    const status = c.res.status;
    if (status !== 403 && status !== 429) return;

    // Authenticated user id when known, shared "anon" bucket otherwise.
    // No IP parsing: proxy headers are spoofable, raw socket IP is
    // unavailable under plain Bun.serve without the hono adapter.
    const key =
      (c.get("user") as { id?: string } | undefined)?.id ?? "anon";
    const now = Date.now();
    sweep(now);

    const entry = hits.get(key);
    if (!entry || now > entry.resetAt) {
      hits.set(key, { count: 1, resetAt: now + WINDOW_MS, alerted: false });
      return;
    }

    entry.count += 1;
    if (!entry.alerted && entry.count >= THRESHOLD) {
      entry.alerted = true;
      log.warn(
        `[SECURITY] repeated ${status} from ${key} (${entry.count} in ${WINDOW_MS / 60000}min)`,
        { path: c.req.path },
      );
    }
  };
}
