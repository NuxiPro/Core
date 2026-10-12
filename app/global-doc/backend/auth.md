# Auth

Config: `src/auth/auth.ts` (better-auth + Drizzle adapter, PostgreSQL). Tables: `user`, `session`, `account`, `verification` (FK cascade delete — deleting a user deletes sessions + accounts).

## Sign-in methods

- Email + password (min 8 chars).
- Magic-link (prod: email via Loops, being migrated to Plunk; local dev: URL printed in the terminal, no email tool needed).
- Google OAuth (active).
- GitHub OAuth (planned, enabled later).

## Verification

- Links expire after 1 hour, auto sign-in after verification, redirects to `/onboarding`.
- Unverified users older than 2 days are purged by the cron (see `features.md`).

## Local dev

- `NODE_ENV !== "production"` → the magic-link URL is printed in the backend terminal logs (`[dev] magic link for <email>: <url>`). Look directly in the backend logs, copy the URL, open it in the browser to sign in. No email account or API key needed.
- Prod (`NODE_ENV=production`) → the link is sent by the email helper.

## Guards and limits

- `/auth/*` goes straight to the better-auth handler. Business routes go through `authGuard`: 401 unauthenticated, 403 email not verified (see `data-flow.md`).
- better-auth rate limit: 20 requests / 2 min (brute-force protection).
- Client IP from `cf-connecting-ip`, `x-forwarded-for`, `x-real-ip` (Cloudflare/proxy fallbacks).

## Ownership rule

Every task/project query is scoped `WHERE id + userId` (+ same-project check on moves). A user can never read or change another user's data, even with a valid id.
