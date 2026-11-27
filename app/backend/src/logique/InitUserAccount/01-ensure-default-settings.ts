import { db } from "@backend/src/drizzle/connection";
import { userSetting } from "@backend/src/drizzle/schemas";
import { createLogger } from "../logging/logger";

const log = createLogger("init user account");

const ALLOWED_LANGUAGES = ["fr", "en"] as const;

export type Lang = (typeof ALLOWED_LANGUAGES)[number];
export type LanguageSource = "magic-link-stash" | "oauth-state" | "fallback";
export function toLang(input: unknown): Lang {
  return ALLOWED_LANGUAGES.includes(input as Lang) ? (input as Lang) : "en";
}

/** Where a seeded language came from — observability only, never trusted as-is. */
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
      language,
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
