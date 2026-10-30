import { sendEmail } from "@backend/utils/PlunkEmail/magic-link";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { admin, lastLoginMethod, magicLink } from "better-auth/plugins";
import { db } from "./drizzle/connection/index";
import * as schema from "./drizzle/schemas/index";
import { RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS } from "./lib/rate-limit-config";
import { toLang } from "./logique/InitUserAccount/01-ensure-default-settings";
import { seedAccountDefaults } from "./logique/InitUserAccount/seed";
import {
  consumeStashedLanguage,
  getUserLanguage,
  stashSignUpLanguage,
} from "./logique/InitUserAccount/user-language";
import { createLogger } from "./logique/logging/logger";

const log = createLogger("auth");

export const auth = betterAuth({
  user: {
    create: {
      after: async (user: { id: string; email: string }, hookCtx?: unknown) => {
        try {
          // Le header n'EST PAS dispo ici (clic sur le lien = navigation
          // navigateur → doc 08 §1). On relit le stash posé par
          // sendMagicLink ; sinon default "en".
          const ctx = hookCtx as
            | {
                context?: {
                  internalAdapter: Parameters<typeof consumeStashedLanguage>[2];
                };
              }
            | undefined;

          await seedAccountDefaults({
            id: user.id,
            email: user.email,
            language: ctx?.context
              ? await consumeStashedLanguage(
                  user.email,
                  toLang(null),
                  ctx.context.internalAdapter,
                )
              : toLang(null),
          });
        } catch (err) {
          // Garde-fou n°2 : un seed raté ne bloque JAMAIS la connexion.
          // L'idempotence permet le re-seed au prochain passage authentifié.
          log.error("[UserInit] Account seeding failed", err);
        }
      },
    },
    additionalFields: {
      name: {
        type: "string",
        required: false,
      },
      role: { type: "string", defaultValue: "user", input: false },
    },
  },
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: process.env.FRONTEND_URL_ALLOWED?.split(",") ?? [],
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailVerification: {
    expiresIn: 3600,
    autoSignInAfterVerification: true,
    callbackURL: "/onboarding",
    sendOnSignUp: true,
  },
  account: {
    encryptOAuthTokens: true,
  },
  plugins: [
    magicLink({
      // Magic links are valid 15 minutes only.
      expiresIn: 900,
      storeToken: "hashed",
      sendMagicLink: async ({ email, url }, ctx) => {
        // 1. Header de la requête (aucune dépendance base → testable unitairement)
        const headerLang = toLang(
          ctx?.request?.headers?.get("x-user-language") ?? null,
        );
        // 2. Langue déjà persistée (1er envoi → null → on retombe sur le header)
        const lang = (await getUserLanguage(email)) ?? headerLang;

        // 3. 1er envoi : on stoke la langue pour que le seed puisse la relire
        if (!ctx?.context) return;
        const existing =
          await ctx.context.internalAdapter.findUserByEmail(email);
        if (!existing)
          await stashSignUpLanguage(email, lang, ctx.context.internalAdapter);

        if (process.env.NODE_ENV === "development") {
          log.info(`[Magic Link] ${url}`);
          return;
        }
        await sendEmail(email, url, lang);
      },
    }),
    admin(),
    lastLoginMethod(),
  ],
  rateLimit: {
    enabled: true,
    // better-auth window is in seconds.
    window: RATE_LIMIT_WINDOW_MS / 1000,
    max: RATE_LIMIT_MAX,
    customRules: {
      // Tighten email-sending routes: anti-spam on magic links.
      "/sign-in/magic-link": { window: 60, max: 5 },
    },
  },
  advanced: {
    ipAddress: {
      ipAddressHeaders: [],
      trustedProxies: [],
    },
  },
  socialProviders: {
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        }
      : {}),
    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
      ? {
          github: {
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
          },
        }
      : {}),
  },
});
