// Logger partagé — source unique frontend + backend
const IS_PROD =
  (typeof process !== "undefined" && process.env.NODE_ENV === "production") ||
  (typeof import.meta !== "undefined" && (import.meta as unknown as { env?: { PROD?: boolean } }).env?.PROD === true);

// Exporte les couleurs pour réutilisation externe (ex: httpLogger)
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

function timestamp(): string {
  return `${C.dim}[${new Date().toISOString().replace("T", " ").slice(0, 19)}]${C.reset}`;
}

// Affiche le log avec préfixe [timestamp] LEVEL [context]. Gère Error (stack) et objet (JSON)
function print(level: Level, ctx: string, msg: string, extra?: unknown): void {
  const prefix = `${timestamp()} ${COLOR[level]}${C.bold}${LABEL[level]}${C.reset} ${C.dim}[${ctx}]${C.reset}`;
  let output = `${prefix} ${msg}`;

  if (extra !== undefined) {
    const detail = extra instanceof Error ? `${extra.message}\n${extra.stack ?? ""}` : JSON.stringify(extra, null, 2);
    output += `\n${C.dim}${detail}${C.reset}`;
  }

  const consoleMethod = level === "error" ? "error" : level === "warn" ? "warn" : "log";
  // biome-ignore lint/suspicious/noConsole: seul endroit autorisé
  console[consoleMethod](output);
}

export type SentryLike = {
  captureException: (err: unknown, ctx?: unknown) => void;
  captureMessage: (msg: string, ctx?: unknown) => void;
};

function isPlainObject(value: unknown): boolean {
  return typeof value === "object" && value !== null && !(value instanceof Error);
}

function mergeDetails(firstDetail?: unknown, secondDetail?: unknown): unknown {
  if (secondDetail === undefined) return firstDetail;
  if (firstDetail === undefined) return secondDetail;
  if (isPlainObject(firstDetail) && isPlainObject(secondDetail))
    return { ...(firstDetail as object), ...(secondDetail as object) };
  return { error: firstDetail, ...(secondDetail as object) };
}

export function createLogger(context: string, _sentry?: SentryLike) {
  return {
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
      print("error", context, msg, mergeDetails(firstDetail, secondDetail));
    },
  };
}
