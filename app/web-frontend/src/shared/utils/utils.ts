import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function that combines and merges CSS class names intelligently.
 * Handles Tailwind CSS class conflicts by removing duplicates/overrides.
 * Safe for dynamic class composition without style collisions.
 */
export function cn(...inputs: ClassValue[]) {
  // clsx: flattens and filters class inputs (removes falsy values, handles conditionals)
  // twMerge: resolves Tailwind CSS class conflicts (e.g., w-full + w-1/2 → w-1/2 wins)
  return twMerge(clsx(inputs));
}

import { slugify } from "@packages/shared/utils/slug";

export { slugify };

/**
 * Génère un slug lisible sans suffixe technique.
 * "Marketing Q3" → "marketing-q3" (pas de -a671)
 * Les doublons sont gérés côté serveur avec -2, -3 (lisible non-tech)
 */
function projectSlug(name: string, _id?: string): string {
  return slugify(name);
}

/**
 * Trouve un projet par son slug stocké en DB.
 */
export function findProjectBySlug<
  T extends { id: string; name: string; slug?: string },
>(projects: T[], slug: string): T | undefined {
  // Priorité au slug stocké en DB (lisible, stable)
  const byStored = projects.find((p) => (p as { slug?: string }).slug === slug);
  if (byStored) return byStored;
  // Fallback ancien format ou sans DB : compare slugify(name)
  return projects.find(
    (p) => slugify(p.name) === slug || projectSlug(p.name, p.id) === slug,
  );
}
