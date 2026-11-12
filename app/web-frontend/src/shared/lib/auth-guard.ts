import { queryClient } from "@/src/shared/lib/queryClient";
import { authClient } from "./client";

type Session = typeof authClient.$Infer.Session;
let redirecting = false;

// Prevent redirect loops on auth error: clear cache and redirect to login
export function handleAuthError() {
  if (redirecting) return;
  redirecting = true;
  queryClient.clear();
  window.location.href = "/login";
}

// Return cached session immediately, or wait for the pending state to resolve
export async function resolveSession(): Promise<Session["session"] | null> {
  const cached = authClient.useSession.get();
  if (!cached.isPending) return cached.data?.session ?? null;
  return new Promise((res) => {
    const unsub = authClient.useSession.subscribe((v) => {
      if (!v.isPending) {
        unsub();
        res(v.data?.session ?? null);
      }
    });
  });
}

// Wait until session satisfies the check condition, or reject on timeout
export function waitForSession(
  check: (s: Session | null) => boolean,
  timeoutMs = 5000,
): Promise<void> {
  return new Promise((res, rej) => {
    const t = setTimeout(() => {
      unsub();
      rej(new Error("waitForSession timeout"));
    }, timeoutMs);
    const unsub = authClient.useSession.subscribe((v) => {
      if (check(v.data ?? null)) {
        clearTimeout(t);
        unsub();
        res();
      }
    });
  });
}
