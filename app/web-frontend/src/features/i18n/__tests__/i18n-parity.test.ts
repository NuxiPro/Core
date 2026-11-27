import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

// i18n parity guard.
//
// A key used in a component but missing from the locales shows the raw
// key (or a hardcoded fallback) to the user — the archive.group.* bug
// cannot come back once this test runs in CI.

// This file lives at src/features/i18n/__tests__/ → 3 levels up = src.
const SRC_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../..",
);
const LOCALES_DIR = path.join(SRC_DIR, "features/i18n/locales");

// The locale files are nested JSON: flatten them to dot keys,
// e.g. { "archive": { "title": "Archive" } } → "archive.title".
function flatten(obj: unknown, prefix = ""): string[] {
  if (obj === null || typeof obj !== "object") return [prefix];
  if (Array.isArray(obj)) {
    return obj.flatMap((v, i) =>
      flatten(v, prefix ? `${prefix}.${i}` : String(i)),
    );
  }
  return Object.entries(obj as Record<string, unknown>).flatMap(([k, v]) =>
    flatten(v, prefix ? `${prefix}.${k}` : k),
  );
}

function loadLocaleKeys(locale: string): Set<string> {
  const file = path.join(LOCALES_DIR, `${locale}.json`);
  const json = JSON.parse(fs.readFileSync(file, "utf8"));
  return new Set(flatten(json));
}

// Every .ts/.tsx file of the app, test files excluded.
function sourceFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(full);
    if (!/\.(ts|tsx)$/.test(entry.name)) return [];
    if (/\.test\./.test(entry.name)) return [];
    return [full];
  });
}

// Literal keys only: t("archive.title"), t('x', { n }), t("x", "fallback").
// Dynamic keys are NOT scanned, on purpose — they cannot be checked
// statically: t(`column.title.${colId}`), t(option.labelKey), t(someVar).
const T_LITERAL_CALL = /\bt\(\s*["']([^"']+)["']/g;

// key → first file that uses it (for a readable failure message).
function usedKeys(): Map<string, string> {
  const keys = new Map<string, string>();
  for (const file of sourceFiles(SRC_DIR)) {
    const src = fs.readFileSync(file, "utf8");
    for (const match of src.matchAll(T_LITERAL_CALL)) {
      if (!keys.has(match[1])) {
        keys.set(match[1], path.relative(SRC_DIR, file));
      }
    }
  }
  return keys;
}

describe("i18n parity", () => {
  const en = loadLocaleKeys("en");
  const fr = loadLocaleKeys("fr");
  const used = usedKeys();

  it("scans real data (the guard is not vacuous)", () => {
    // If any of these is 0, the paths or the regex broke silently and
    // every other assertion below would pass without checking anything.
    expect(en.size).toBeGreaterThan(0);
    expect(fr.size).toBeGreaterThan(0);
    expect(used.size).toBeGreaterThan(0);
  });

  it("every key used in the code exists in both locales", () => {
    const missing = [...used]
      .filter(([key]) => !en.has(key) || !fr.has(key))
      .map(([key, file]) => `${key} (${file})`);
    expect(missing).toEqual([]);
  });

  it("en.json and fr.json expose the same keys", () => {
    const onlyInEn = [...en].filter((key) => !fr.has(key));
    const onlyInFr = [...fr].filter((key) => !en.has(key));
    expect({ onlyInEn, onlyInFr }).toEqual({ onlyInEn: [], onlyInFr: [] });
  });
});
