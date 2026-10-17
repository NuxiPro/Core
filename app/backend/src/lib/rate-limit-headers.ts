// Rate-limit headers (IETF style) for 429 / quota responses.
// Pure functions — no framework dependency.
// Inspired by Kaneo (MIT, © Andrej Acevski) — rewritten for this codebase.

export type ApiRateLimit = {
  limit: number;
  remaining: number;
  resetAt: Date;
};

export function retryAfterSeconds(retryAt: Date, now: Date): string {
  return String(
    Math.max(1, Math.ceil((retryAt.getTime() - now.getTime()) / 1000)),
  );
}

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
