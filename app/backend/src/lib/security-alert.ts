import { createLogger } from "@packages/shared/utils/logger";
import type { MiddlewareHandler } from "hono";
import { RATE_LIMIT_WINDOW_MS, SECURITY_ALERT_THRESHOLD } from "./rate-limit-config";

const log = createLogger("security");

// Alert when refusals (403/429) stack up to the global rate-limit budget:
// whoever hits the limiter repeatedly gets one log line (OpenObserve picks it up).
const WINDOW_MS = RATE_LIMIT_WINDOW_MS;
const THRESHOLD = SECURITY_ALERT_THRESHOLD;
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

    // Anonymous key: user UUID (or "anon") + route only — no email, no IP (GDPR-safe).
    const userId =
      (c.get("user") as { id?: string } | undefined)?.id ?? "anon";
    const key = `${userId} ${c.req.path}`;
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
      // Self-explanatory + queryable (OpenObserve): who (UUID), where, how many.
      // No action taken — alert only. If legit user: raise quota. If attack: block at proxy.
      log.alert(
        `[SECURITY] repeated refusals (alert only, nothing blocked): user=${userId} route=${c.req.path} status=${status} count=${entry.count} window=${WINDOW_MS / 60000}min`,
        { userId, route: c.req.path, status, count: entry.count },
      );
    }
  };
}
