// Shared logger (frontend + backend).
// Dev: colored human lines. Prod (or LOG_FORMAT=json): one JSON line per log,
// so collectors like OpenObserve can parse level/context/fields.
// Runtime-agnostic env access (no @types/node — this file is shared with the frontend).
declare const process: { env?: Record<string, string | undefined> } | undefined;

const IS_PROD =
  (typeof process !== "undefined" && process?.env?.NODE_ENV === "production") ||
  (typeof import.meta !== "undefined" && (import.meta as unknown as { env?: { PROD?: boolean } }).env?.PROD === true);

const JSON_LOGS =
  (typeof process !== "undefined" && process?.env?.LOG_FORMAT === "json") || IS_PROD;

// Kept for external reuse (ex: httpLogger status colors). Unused in JSON mode.
export const C = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  bold: "\x1b[1m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  gray: "\x1b[90m",
} as const;

type Level = "debug" | "info" | "warn" | "error";
const LABEL: Record<Level, string> = { debug: "DEBUG", info: "INFO ", warn: "WARN ", error: "ERROR" };
const COLOR: Record<Level, string> = { debug: C.gray, info: C.cyan, warn: C.yellow, error: C.red };

// Error -> {message, stack}, circular-safe fallback to String().
function detail(extra: unknown): unknown {
  if (extra instanceof Error) return { message: extra.message, stack: extra.stack ?? "" };
  try {
    JSON.stringify(extra);
    return extra;
  } catch {
    return String(extra);
  }
}

function print(level: Level, ctx: string, msg: string, extra?: unknown): void {
  if (JSON_LOGS) {
    // biome-ignore lint/suspicious/noConsole: single allowed place
    console[level === "error" ? "error" : level === "warn" ? "warn" : "log"](
      JSON.stringify({ ts: new Date().toISOString(), level, ctx, msg, extra: detail(extra) }),
    );
    return;
  }
  const prefix = `${C.dim}[${new Date().toISOString().replace("T", " ").slice(0, 19)}]${C.reset} ${COLOR[level]}${C.bold}${LABEL[level]}${C.reset} ${C.dim}[${ctx}]${C.reset}`;
  const line =
    extra === undefined ? `${prefix} ${msg}` : `${prefix} ${msg}\n${C.dim}${JSON.stringify(detail(extra), null, 2)}${C.reset}`;
  // biome-ignore lint/suspicious/noConsole: single allowed place
  console[level === "error" ? "error" : level === "warn" ? "warn" : "log"](line);
}

export type SentryLike = {
  captureException: (err: unknown, ctx?: unknown) => void;
  captureMessage: (msg: string, ctx?: unknown) => void;
};

export function createLogger(context: string, _sentry?: SentryLike) {
  return {
    // info/debug stay silent in prod (deliberate); warn/error always ship.
    debug(msg: string, extra?: unknown): void {
      if (!IS_PROD) print("debug", context, msg, extra);
    },
    info(msg: string, extra?: unknown): void {
      if (!IS_PROD) print("info", context, msg, extra);
    },
    warn(msg: string, extra?: unknown): void {
      print("warn", context, msg, extra);
    },
    error(msg: string, firstDetail?: unknown, secondDetail?: unknown): void {
      const a = detail(firstDetail);
      const b = detail(secondDetail);
      const merged =
        secondDetail === undefined ? a : a !== null && typeof a === "object" && b !== null && typeof b === "object" ? { ...(a as object), ...(b as object) } : { error: a, ...(b as object) };
      print("error", context, msg, merged);
    },
  };
}
