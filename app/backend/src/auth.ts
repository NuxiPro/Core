import { sendEmail } from "@backend/utils/PlunkEmail/magic-link";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth} from "better-auth";
import { db } from "./drizzle/connection/index";
import * as schema from "./drizzle/schemas/index";
import { createLogger } from "./logique/logging/logger";
import { admin, lastLoginMethod, magicLink } from "better-auth/plugins";
import { RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS } from "./lib/rate-limit-config";
const log = createLogger("auth");

// Local dev: print magic links in the terminal, no email tool needed.
// Prod (!isDev): send via the email helper (loops.ts, being migrated to Plunk).
const isDev = process.env.NODE_ENV !== "production";

export const auth = betterAuth({
  user: {
    additionalFields: {
      name: {
        type: "string",
        required: false,
      },
      role: { type: "string", defaultValue: "user", input: false},
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
  plugins: [
    magicLink({
      // Magic links are valid 15 minutes only.
      expiresIn: 900,
      storeToken: "hashed",
      sendMagicLink: async ({ email, url }) => {
        if (isDev) {
          console.log(`[dev] magic link for ${email}: ${url}`);
          return;
        }
        void sendEmail(email, url).catch((err: string) => {
          log.error(`Failed to send magic link to ${email}`, err);
        });
      }
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
