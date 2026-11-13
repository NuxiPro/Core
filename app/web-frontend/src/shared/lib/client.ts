import type { AppType } from "@backend/src/index";
import { createLogger } from "@packages/shared/utils/logger";
import type { AuthClient } from "better-auth/client";
import { createAuthClient } from "better-auth/client";
import {
  lastLoginMethodClient,
  magicLinkClient,
} from "better-auth/client/plugins";
import { hc } from "hono/client";
import i18n, { SUPPORTED_LANGUAGES } from "@/src/features/i18n";
import { reportRateLimited } from "@/src/layout/components/animation/rate-limit-policy";
import { handleAuthError } from "./auth-guard";

const log = createLogger("client");
const API_URL = import.meta.env.BACKEND_API_URL as string;
const AUTH_URL = import.meta.env.BACKEND_AUTH_URL as string;

// Retourne uniquement une langue supportée par l'API.
export function getActiveLanguage(): (typeof SUPPORTED_LANGUAGES)[number] {
  const current = i18n.language;
  if (!current) {
    log.warn("No language detected, falling back to 'en'");
    return "en";
  }

  const matched = SUPPORTED_LANGUAGES.find(
    (l) => current === l || current.startsWith(`${l}-`),
  );

  if (!matched) {
    log.warn(`Unsupported language '${current}', falling back to 'en'`);
    return "en";
  }

  return matched;
}

// Affiche les URLs externes en développement pour faciliter le diagnostic.
function logExternalUrls(): void {
  if (!import.meta.env.DEV) return;

  for (const [name, url] of [
    ["API", API_URL],
    ["Auth", AUTH_URL],
  ] as const) {
    if (!url) continue;
    try {
      const parsedUrl = new URL(url);
      const isExternal =
        typeof window !== "undefined" &&
        parsedUrl.origin !== window.location.origin;

      if (isExternal) {
        log.info(`[${name}] external: ${url}`);
      }
    } catch {
      log.error(`[${name}] invalid URL: ${url}`);
    }
  }
}

logExternalUrls();

type AuthClientWithMagicLink = AuthClient<{
  plugins: [
    ReturnType<typeof magicLinkClient>,
    ReturnType<typeof lastLoginMethodClient>,
  ];
}>;

// Ajoute la langue active à chaque requête API.
function withLanguageHeader(init?: RequestInit): RequestInit {
  const headers =
    init?.headers instanceof Headers
      ? Object.fromEntries(init.headers.entries())
      : (init?.headers ?? {});

  return {
    ...init,
    headers: {
      ...headers,
      "X-User-Language": getActiveLanguage(),
    },
  };
}

function getRequestUrl(input: RequestInfo | URL): string {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.href;
  return input.url;
}

// Applique les traitements communs aux réponses API.
function handleApiResponse(response: Response, url: string): void {
  const isProtectedApiRequest =
    url.includes("/api/v1") && !url.includes("/api/v1/auth/");

  if (response.status === 401 && isProtectedApiRequest) {
    handleAuthError();
  }

  if (response.status !== 429) return;

  const retryAfter = Number(
    response.headers.get("Retry-After") ??
      response.headers.get("X-Retry-After") ??
      "120",
  );

  if (Number.isFinite(retryAfter)) {
    reportRateLimited(retryAfter);
  }
}

// Fetch partagé par Hono et les appels qui doivent envoyer la langue.
const fetcher = async (
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> => {
  const response = await fetch(input, withLanguageHeader(init));
  handleApiResponse(response, getRequestUrl(input));
  return response;
};

export const authClient = createAuthClient({
  baseURL: AUTH_URL,
  plugins: [magicLinkClient(), lastLoginMethodClient()],
  fetchOptions: {
    headers: {
      get "X-User-Language"() {
        return getActiveLanguage();
      },
    },
  },
}) as AuthClientWithMagicLink;

export const client = hc<AppType>(API_URL || "/", {
  fetch: fetcher,
  init: { credentials: "include" },
} as const);
