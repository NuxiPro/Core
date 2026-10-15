/**
 * Shared slug — single source for backend and frontend
 * Non-tech readable: "Marketing Q3" → "marketing-q3", duplicate → "marketing-q3-2"
 */

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50) || "projet";
}

export function createSlug(name: string, existing: string[] = []): string {
  let base = slugify(name);
  let slug = base;
  let i = 2;
  while (existing.includes(slug)) slug = `${base}-${i++}`;
  return slug;
}

export function isSlugAvailable(slug: string, existing: string[]): boolean {
  return !existing.includes(slug);
}

export function generateProjectSlug(name: string, existing: string[] = []): string {
  return createSlug(name, existing);
}
