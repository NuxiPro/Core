import { createLogger } from "./logger";

type ApiErrorResponse = { message?: string };

const log = createLogger("Api/client");

/**
 * Parse la réponse API de manière sûre.
 * Lit le body une seule fois (évite le double response.json()).
 * Lance une Error si response.ok est false.
 * Log automatiquement l'erreur via PostHog (sans données sensibles).
 */
export async function handleResponse<T>(
  response: { ok: boolean; status: number; json(): Promise<unknown> },
  errorMessage: string,
  context?: string,
): Promise<T> {
  const body = await response.json();

  if (!response.ok) {
    const message = (body as ApiErrorResponse).message || errorMessage;

    log.error(message, {
      ...(context && { context }),
      status: response.status,
    });

    throw new Error(message);
  }

  return body as T;
}
