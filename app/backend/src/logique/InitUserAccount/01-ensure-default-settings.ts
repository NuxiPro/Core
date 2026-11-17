import { db } from "@backend/src/drizzle/connection";
import { userSetting } from "@backend/src/drizzle/schemas";
import { createLogger } from "../logging/logger";

const log = createLogger("init user account");

const ALLOWED_LANGS = ["fr", "en"] as const;
export type Lang = (typeof ALLOWED_LANGS)[number];

// La seule fonction de validation dont tu as besoin.
// Utile aussi pour le header X-User-Language (voir 06) : entrée hostile → enum de 2 valeurs.
export function toLang(input: unknown): Lang {
  return ALLOWED_LANGS.includes(input as Lang) ? (input as Lang) : "en";
}

/** Where a seeded language came from — observability only, never trusted as-is. */
export type LanguageSource = "magic-link-stash" | "oauth-state" | "fallback";

export async function StepDefaultSettings(user: {
  id: string;
  language?: string;
  languageSource?: LanguageSource;
}) {
  const language = toLang(user.language);
  await db
    .insert(userSetting)
    .values({
      userId: user.id,
      language, // amorce : "fr" | "en" — fallback "en"
      theme: "system",
    })
    .onConflictDoNothing();
  // Seed observability: "why did this account boot in English?" becomes
  // answerable from logs (value + origin) instead of guesswork.
  log.info("Default settings seeded", {
    userId: user.id,
    language,
    source: user.languageSource ?? "fallback",
  });
}
