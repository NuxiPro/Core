import { describe, expect, it } from "bun:test";
import { getDbDateStr, isDBDateStr } from "../dateHelpers";

describe("getDbDateStr", () => {
  it("retourne un ISO 8601 valide (terminant par Z, séparateur T)", () => {
    const result = getDbDateStr();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });
});

describe("isDBDateStr", () => {
  it("accepte un ISO 8601 généré par getDbDateStr", () => {
    expect(isDBDateStr(getDbDateStr())).toBe(true);
  });

  it("rejette une chaîne non-date", () => {
    expect(isDBDateStr("pas-une-date")).toBe(false);
  });
});
