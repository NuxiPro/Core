// Single source of truth for request throttling.
// Used by better-auth rate limiting AND the security alert threshold,
// so tuning one place updates both.
export const RATE_LIMIT_WINDOW_MS = 120_000;
export const RATE_LIMIT_MAX = 20;
