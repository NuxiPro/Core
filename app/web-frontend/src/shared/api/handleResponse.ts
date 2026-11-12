import { createLogger } from "./logger";

type ApiErrorResponse = { message?: string };

/** Contrat minimal d'un parseur de schéma (rempli par `z.ZodType`). */
export interface Schema<T> {
  parse(input: unknown): T;
}

const log = createLogger("Api/client");

/**
 * Parse la réponse API de manière sûre.
 * Lit le body une seule fois (évite le double response.json()).
 * Lance une Error si response.ok est false.
 * Log automatiquement l'erreur via PostHog (sans données sensibles).
 *
 * Sécurité par défaut : la réponse du réseau est une ENTRÉE HOSTILE.
 * - `schema` fourni → le body est validé avant d'être retourné (jamais
 *   de `as T` à l'aveugle) ; échec de validation → log + Error, jamais de
 *   donnée non-typée qui remonte dans le cache.
 * - `schema` absent → comportement historique (parsing brut), à migrer
 *   progressivement.
 * - Body vide/malformé → null au lieu d'un SyntaxError qui casse le cache
 *   (TanStack ne persiste pas une query en erreur → refetch à chaque monture).
 */
export async function handleResponse<T>(
  response: { ok: boolean; status: number; json(): Promise<unknown> },
  errorMessage: string,
  context?: string,
  schema?: Schema<T>,
): Promise<T> {
  let body: unknown = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (!response.ok) {
    const message = (body as ApiErrorResponse | null)?.message || errorMessage;

    log.error(message, undefined, {
      ...(context && { context }),
      extra: { status: response.status },
    });

    throw new Error(message);
  }

  if (schema) {
    // Body vide + 200 = "pas de données" (benin, ex: compte sans réglages)
    // → null, PAS d'erreur et PAS de log : le caller décide (défauts, …).
    // Seule une réponse PRÉSENTE mais invalide = violation de contrat → log + Error.
    if (body === null) {
      return null as T;
    }
    try {
      return schema.parse(body);
    } catch {
      log.error("Invalid response shape", undefined, {
        ...(context && { context }),
        extra: { status: response.status },
      });
      throw new Error(errorMessage);
    }
  }

  return body as T;
}
