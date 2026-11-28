import type { MiddlewareHandler } from "hono";
import {
  RATE_LIMIT_API_MAX,
  RATE_LIMIT_API_WINDOW_MS,
} from "./rate-limit-config";
import { rateLimitHeaders } from "./rate-limit-headers";

// Per-user fixed-window limiter for business routes.
// Runs AFTER authGuard (user is set). Anonymous hits are ignored here
// (authGuard already 401s them). In-memory: fine mono-instance,
// Redis store needed only if multi-instance.
const MAX_KEYS = 5000;

const hits = new Map<
  string,
  { count: number; resetAt: number; penalties: number; blocked: boolean }
>();

// Progressive sanction: 60s, then 120s, 300s… capped at 15min.
// Each exceed extends the block — scripts back off, humans never see it.
const BASE_BLOCK_S = 60;
const MAX_BLOCK_S = 900;

export function apiRateLimit(): MiddlewareHandler {
  return async (c, next) => {
    const user = c.get("user") as { id?: string } | undefined;
    if (!user?.id) {
      await next();
      return;
    }

    const now = new Date();
    const entry = hits.get(user.id);
    if (!entry || now.getTime() > entry.resetAt) {
      // Full quiet window (block expired long ago) = clean slate.
      const quiet =
        !entry || now.getTime() - entry.resetAt > RATE_LIMIT_API_WINDOW_MS;
      hits.set(user.id, {
        count: 1,
        resetAt: now.getTime() + RATE_LIMIT_API_WINDOW_MS,
        penalties: quiet ? 0 : (entry?.penalties ?? 0),
        blocked: false,
      });
      if (hits.size > MAX_KEYS) hits.delete(hits.keys().next().value as string);
      c.header("X-RateLimit-Limit", String(RATE_LIMIT_API_MAX));
      c.header("X-RateLimit-Remaining", String(RATE_LIMIT_API_MAX - 1));
      c.header(
        "X-RateLimit-Reset",
        String(Math.ceil((now.getTime() + RATE_LIMIT_API_WINDOW_MS) / 1000)),
      );
      await next();
      return;
    }

    entry.count += 1;
    const resetAt = new Date(entry.resetAt);
    const remaining = RATE_LIMIT_API_MAX - entry.count;

    if (entry.count > RATE_LIMIT_API_MAX) {
      // One penalty per block episode — not per refused request.
      if (!entry.blocked) {
        entry.blocked = true;
        entry.penalties += 1;
      }
      const blockS = Math.min(
        BASE_BLOCK_S * 2 ** (entry.penalties - 1),
        MAX_BLOCK_S,
      );
      const blockedUntil = new Date(now.getTime() + blockS * 1000);
      entry.resetAt = blockedUntil.getTime();
      const headers = {
        ...rateLimitHeaders({
          limit: RATE_LIMIT_API_MAX,
          remaining: 0,
          resetAt: blockedUntil,
        }),
        "Retry-After": String(blockS),
      };
      return c.json({ error: "Too many requests" }, 429, headers);
    }

    for (const [k, v] of Object.entries(
      rateLimitHeaders({
        limit: RATE_LIMIT_API_MAX,
        remaining,
        resetAt,
      }),
    )) {
      c.header(k, v);
    }
    await next();
  };
}
