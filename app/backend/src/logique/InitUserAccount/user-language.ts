import { db } from "@backend/src/drizzle/connection";
import { user, verification } from "@backend/src/drizzle/schemas";
import { getOAuthState } from "better-auth/api";
import { eq } from "drizzle-orm";
import { userSetting } from "../../drizzle/schemas/user-center";
import {
  type Lang,
  type LanguageSource,
  toLang,
} from "./01-ensure-default-settings";

/**
 * Language already saved for this email, or `null` when:
 *  - the account does not exist yet (first send), or
 *  - the user never touched settings (no row).
 *
 * Always prepared queries + drizzle `eq()`. No template literals.
 */
export async function getUserLanguage(email: string): Promise<Lang | null> {
  const rows = await db
    .select({ language: userSetting.language })
    .from(userSetting)
    .innerJoin(user, eq(userSetting.userId, user.id))
    .where(eq(user.email, email))
    .limit(1);

  const lang = rows[0]?.language;
  return lang ? toLang(lang) : null;
}

const STASH_PREFIX = "lang:";

/** Save the chosen language when the link is sent (user not in DB yet). */
export async function stashSignUpLanguage(
  email: string,
  lang: Lang,
  internalAdapter: {
    createVerificationValue: (v: {
      identifier: string;
      value: string;
      expiresAt: Date;
    }) => Promise<unknown>;
  },
): Promise<void> {
  const payload = {
    identifier: `${STASH_PREFIX}${email}`,
    value: lang,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 min — must cover the magic-link TTL (auth.ts expiresIn: 900)
  };
  await internalAdapter.createVerificationValue(payload);
}

/**
 * Read + consume the language stash at seed time.
 * Reads the `verification` table directly: the context passed to the
 * `user.create.after` hook does not expose internalAdapter (seen in
 * dev, setting.md §4/§6).
 * Returns `null` when missing or expired — the caller decides the fallback.
 */
export async function consumeStashedLanguage(
  email: string,
): Promise<Lang | null> {
  const identifier = `${STASH_PREFIX}${email}`;
  const rows = await db
    .select({ value: verification.value, expiresAt: verification.expiresAt })
    .from(verification)
    .where(eq(verification.identifier, identifier))
    .limit(1);

  const row = rows[0];
  // Delete always: an expired stash must not outlive its own read.
  await db.delete(verification).where(eq(verification.identifier, identifier));
  if (!row || row.expiresAt.getTime() <= Date.now()) return null;
  return toLang(row.value);
}

/**
 * Resolve the language a new account is seeded with, and where it came from.
 * Order: magic-link stash → OAuth server state → "en" fallback.
 *
 * The UI-language header is NOT available at seed time (link click /
 * provider callback = browser navigation → doc 08 §1), so both paths relay
 * it earlier in the flow instead:
 * - magic link: `sendMagicLink` stashes it when the email is sent;
 * - OAuth: the before hook in auth.ts parks it on /sign-in/social in the
 *   server-only OAuth state slot (serverContext — the client cannot write
 *   there).
 */
export async function resolveSeedLanguage(
  email: string,
  hookCtx?: unknown,
): Promise<{ language: Lang; source: LanguageSource }> {
  // Minimal shape of the context better-auth passes to database hooks.
  const ctx = hookCtx as
    | {
        path?: string;
      }
    | undefined;

  // 1. Magic link: the stash was set by sendMagicLink. `null` means absent
  //    or expired — the fallback decision stays here. Read directly from
  //    the DB: the hook context does not expose internalAdapter.
  let language = await consumeStashedLanguage(email);
  let source: LanguageSource = language ? "magic-link-stash" : "fallback";

  // 2. OAuth: read back what the before hook parked on /sign-in/social.
  //    serverContext is server-trusted, but toLang still validates (belt
  //    and braces).
  if (!language && ctx?.path?.startsWith("/callback")) {
    const state = await getOAuthState<{ language?: unknown }>();
    const stateLang = state?.serverContext?.language;
    if (stateLang != null) {
      language = toLang(stateLang);
      source = "oauth-state";
    }
  }

  return { language: language ?? toLang(null), source };
}
