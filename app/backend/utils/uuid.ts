import { randomUUIDv7 } from "bun";
/**
 * Génère un UUID v7 de 128 bits de manière synchrone.
 * Performance maximale pour les Users et Tasks.
 */
export function uuid() {
  return randomUUIDv7();
}
