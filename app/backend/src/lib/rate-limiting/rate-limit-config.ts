// Single source of truth for request throttling.
// Used by better-auth rate limiting AND the security alert threshold,
// so tuning one place updates both.
export const RATE_LIMIT_WINDOW_MS = 120_000;
export const RATE_LIMIT_MAX = 20;

// Security alert threshold (refusals per window before one ALERT line).
// Calibrated against the business quota (200/min): a 429 is already
// unreachable for a human, so 3 refusals = abuse signal, not noise.
export const SECURITY_ALERT_THRESHOLD = 3;

// Business API budget (per authenticated user). Generous on purpose:
// normal use never hits it (~240 req/min frantic), only abuse does.
// Set-and-forget: revisit only on legit-user false positives or multi-instance (Redis).
export const RATE_LIMIT_API_WINDOW_MS = 60_000;
export const RATE_LIMIT_API_MAX = 100;
