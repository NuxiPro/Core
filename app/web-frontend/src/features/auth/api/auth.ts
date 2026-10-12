import { createLogger } from "@/src/shared/api/logger";
import { authClient } from "@/src/shared/lib/client";

const log = createLogger("auth");

export async function signIn(email: string) {
  try {
    const { data, error } = await authClient.signIn.magicLink({
      email,
      callbackURL: `${window.location.origin}/onboarding`,
    });

    if (error) {
      log.error("Failed to send magic link", undefined, {
        extra: { authError: error },
      });
    }

    return { data, error };
  } catch (err) {
    log.error("Network error sign-in", err);
    throw err;
  }
}

export async function signUp(email: string) {
  try {
    const { data, error } = await authClient.signIn.magicLink({
      email,
      callbackURL: `${window.location.origin}/onboarding`,
    });

    if (error) {
      log.error("Failed to send magic link", undefined, {
        extra: { authError: error },
      });
    }

    return { data, error };
  } catch (err) {
    log.error("Network error sign-up", err);
    throw err;
  }
}

export async function signOut() {
  try {
    const { data, error } = await authClient.signOut();
    if (error) {
      log.error("Failed to sign out", undefined, {
        extra: { authError: error },
      });
    }
    return { data, error };
  } catch (err) {
    log.error("Network error sign-out", err);
    throw err;
  }
}
