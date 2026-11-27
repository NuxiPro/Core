// biome-ignore-all lint/suspicious/noConsole: Network failures are reported only during development.
import { authClient } from "@/src/shared/lib/client";

export async function requestMagicLink(email: string) {
  try {
    const { data, error } = await authClient.signIn.magicLink({
      email,
      callbackURL: `${window.location.origin}/onboarding`,
      // Expired or invalid links land on a dedicated feedback page.
      errorCallbackURL: `${window.location.origin}/link-expired`,
    });

    return { data, error };
  } catch (err) {
    if (import.meta.env.DEV) {
      console.error("Magic-link request failed");
    }
    throw err;
  }
}

export async function signOut() {
  try {
    const { data, error } = await authClient.signOut();
    return { data, error };
  } catch (err) {
    if (import.meta.env.DEV) {
      console.error("Sign-out request failed");
    }
    throw err;
  }
}
