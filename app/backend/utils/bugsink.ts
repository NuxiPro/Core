import * as Sentry from "@sentry/bun";

export function configureErrorReporting() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    release: "1.0.0",
    tracesSampleRate: 0,
  });
}
