// Rate-limit headers (IETF style) for 429 / quota responses.
// Pure functions — no framework dependency.
// Inspired by Kaneo (MIT, © Andrej Acevski) — rewritten for this codebase.

export type ApiRateLimit = {
  limit: number;
  remaining: number;
  resetAt: Date;
};

export function rateLimitHeaders({
  limit,
  remaining,
  resetAt,
}: ApiRateLimit): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(limit),
    "X-RateLimit-Remaining": String(Math.max(0, remaining)),
    "X-RateLimit-Reset": String(Math.ceil(resetAt.getTime() / 1000)),
  };
}
