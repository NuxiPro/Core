import { db } from "@backend/src/drizzle/connection";
import { userPreference } from "@backend/src/drizzle/schemas";

const ALLOWED_LANGS = ["fr", "en"] as const;
export type Lang = (typeof ALLOWED_LANGS)[number];

// La seule fonction de validation dont tu as besoin.
// Utile aussi pour le header X-User-Language (voir 06) : entrée hostile → enum de 2 valeurs.
export function toLang(input: unknown): Lang {
  return ALLOWED_LANGS.includes(input as Lang) ? (input as Lang) : "en";
}

export async function StepDefaultSettings(user: {
  id: string;
  language?: string;
}) {
  await db
    .insert(userPreference)
    .values({
      userId: user.id,
      language: toLang(user.language), // amorce : "fr" | "en" — fallback "en"
    })
    .onConflictDoNothing();
}
