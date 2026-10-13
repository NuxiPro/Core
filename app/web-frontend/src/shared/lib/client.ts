import type { AppType } from "@backend/src/index";
import { createLogger } from "@packages/shared/utils/logger";
import type { AuthClient } from "better-auth/client";
import { createAuthClient } from "better-auth/client";
import {
  lastLoginMethodClient,
  magicLinkClient,
} from "better-auth/client/plugins";
import { hc } from "hono/client";
import { handleAuthError } from "./auth-guard";

const log = createLogger("client");
const API_URL = import.meta.env.BACKEND_API_URL as string;
const AUTH_URL = import.meta.env.BACKEND_AUTH_URL as string;

if (import.meta.env.DEV) {
  for (const [name, url] of [
    ["API", API_URL],
    ["Auth", AUTH_URL],
  ] as const) {
    if (!url) continue;
    try {
      const u = new URL(url);
      if (
        typeof window !== "undefined" &&
        u.origin !== window.location.origin
      ) {
        log.info(`[${name}] externe: ${url}`);
      }
    } catch {
      log.error(`[${name}] URL invalide: ${url}`);
    }
  }
}

type AuthClientWithMagicLink = AuthClient<{
  plugins: [
    ReturnType<typeof magicLinkClient>,
    ReturnType<typeof lastLoginMethodClient>,
  ];
}>;

export const authClient = createAuthClient({
  baseURL: AUTH_URL,
  plugins: [magicLinkClient(), lastLoginMethodClient()],
}) as AuthClientWithMagicLink;

const fetcher = async (
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> => {
  const res = await fetch(input as RequestInfo, init);
  const url =
    typeof input === "string"
      ? input
      : input instanceof URL
        ? input.href
        : ((input as Request)?.url ?? "");

  if (
    res.status === 401 &&
    url.includes("/api/v1") &&
    !url.includes("/api/v1/auth/")
  ) {
    handleAuthError();
  }
  if (res.status === 429) {
    const v = Number(res.headers.get("X-Retry-After") || "120");
    if (Number.isFinite(v)) {
      window.dispatchEvent(
        new CustomEvent("rate-limit", { detail: { retryAfter: String(v) } }),
      );
    }
  }
  return res;
};

export const client = hc<AppType>(API_URL || "/", {
  fetch: fetcher,
  init: { credentials: "include" },
} as never);
