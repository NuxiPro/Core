import { eq } from "drizzle-orm";
import { db } from "@backend/src/drizzle/connection";
import { userPreference } from "../../drizzle/schemas/user-center";
import { user } from "@backend/src/drizzle/schemas";
import { toLang, Lang } from "./01-ensure-default-settings";

/**
 * Langue déjà connue pour cet e-mail, ou `null` si :
 *  - le compte n'existe pas encore (1er envoi), ou
 *  - l'utilisateur n'a jamais touché ses settings (pas de ligne).
 *
 * TOUJOURS requête préparée + `eq()` drizzle. Zéro template literal.
 */
export async function getUserLanguage(email: string): Promise<Lang | null> {
  const rows = await db
    .select({ language: userPreference.language })
    .from(userPreference)
    .innerJoin(user, eq(userPreference.userId, user.id))
    .where(eq(user.email, email))
    .limit(1);

  const lang = rows[0]?.language;
  return lang ? toLang(lang) : null;
};

const STASH_PREFIX = "lang:";

/** Persiste la langue choisie au moment de l'envoi du lien (user absent de la DB). */
export async function stashSignUpLanguage(
  email: string,
  lang: Lang,
  internalAdapter: { createVerificationValue: (v: { identifier: string; value: string; expiresAt: Date }) => Promise<unknown> },
): Promise<void> {
  await internalAdapter.createVerificationValue({
    identifier: `${STASH_PREFIX}${email}`,
    value: lang,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 min
  });
}

/** Lit + consomme le stash au seed. Retourne la langue du header, sinon `fallback`. */
export async function consumeStashedLanguage(
  email: string,
  fallback: Lang,
  internalAdapter: {
    findVerificationValue: (v: { identifier: string }) => Promise<{ identifier: string, value: string } | null>;
    deleteVerificationValue: (v: string) => Promise<unknown>;
  },
): Promise<Lang> {
  const record = await internalAdapter.findVerificationValue({
    identifier: `${STASH_PREFIX}${email}`,
  });
  if (!record) return fallback;
  await internalAdapter.deleteVerificationValue(record.identifier);
  return toLang(record.value);
}
