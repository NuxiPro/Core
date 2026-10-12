import { sendEmail } from "@backend/utils/helpers/email/loops";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth} from "better-auth";
import { db } from "../drizzle/connection/index";
import * as schema from "../drizzle/schemas/index";
import { createLogger } from "../logique/logging/logger";
import { admin, magicLink, role } from "better-auth/plugins";
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
        defaultValue: "user",
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
      sendMagicLink: async ({ email, token, url }) => {
        if (isDev) {
          // biome-ignore lint/suspicious/noConsole: dev-only, magic link in terminal
          console.log(`[dev] magic link for ${email}: ${url}`);
          return;
        }
        void sendEmail(email, url).catch((err: string) => {
          log.error(`Failed to send magic link to ${email}`, err);
        });
      }
    }),
    admin()
  ],
  rateLimit: {
    enabled: true,
    window: 120,
    max: 20,
  },
  advanced: {
    ipAddress: {
      ipAddressHeaders: [
        "cf-connecting-ip", // Cloudflare (prod)
        "x-forwarded-for", // Proxy/Nginx (fallback)
        "x-real-ip", // Nginx direct (fallback)
      ],
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
