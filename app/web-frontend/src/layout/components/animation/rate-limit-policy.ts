// Politique d'affichage rate-limit (users connectés).
// 1-2 : message poli. 3+ : ferme (accès temporairement restreint).
// La durée est toujours affichée.

const RATE_LIMIT_FIRM_AFTER = 3;

const STRIKE_KEY = "rl-strikes";
const STRIKE_WINDOW_MS = 5 * 60_000;

export type RateLimitTone = "polite" | "firm";

export function rateLimitTone(strikes: number): RateLimitTone {
  return strikes >= RATE_LIMIT_FIRM_AFTER ? "firm" : "polite";
}

export function formatDuration(totalSeconds: number, locale: string): string {
  const s = Math.max(1, Math.round(totalSeconds));
  if (s < 60) {
    return locale.startsWith("fr")
      ? `${s} seconde${s > 1 ? "s" : ""}`
      : `${s} second${s > 1 ? "s" : ""}`;
  }
  const min = Math.ceil(s / 60);
  return locale.startsWith("fr")
    ? `${min} minute${min > 1 ? "s" : ""}`
    : `${min} minute${min > 1 ? "s" : ""}`;
}

function recordStrike(): number {
  try {
    const now = Date.now();
    const raw = sessionStorage.getItem(STRIKE_KEY);
    let strikes = raw
      ? (JSON.parse(raw) as { count: number; resetAt: number })
      : { count: 0, resetAt: 0 };
    if (!strikes || now > strikes.resetAt) {
      strikes = { count: 0, resetAt: now + STRIKE_WINDOW_MS };
    }
    strikes.count += 1;
    sessionStorage.setItem(STRIKE_KEY, JSON.stringify(strikes));
    return strikes.count;
  } catch {
    return 1;
  }
}

export function reportRateLimited(retryAfterSeconds: number): void {
  const strikes = recordStrike();
  window.dispatchEvent(
    new CustomEvent("rate-limit", {
      detail: { retryAfter: String(retryAfterSeconds), strikes },
    }),
  );
}
