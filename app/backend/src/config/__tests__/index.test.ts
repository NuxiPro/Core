import { describe, expect, it } from "bun:test";
import { getColIdFromSqlId, getColumnId } from "../index";

const COLUMN_IDS = ["todo", "In_Progress", "Done"] as const;

describe("getColumnId", () => {
  it("retourne un sqlId numérique pour chaque ColumnId valide", () => {
    for (const id of COLUMN_IDS) {
      const sqlId = getColumnId(id);
      expect(typeof sqlId).toBe("number");
    }
  });

  it("throw sur une clé inconnue", () => {
    // @ts-expect-error — test runtime
    expect(() => getColumnId("inconnue")).toThrow(
      "Colonne inconnue : inconnue",
    );
  });
});

describe("getColIdFromSqlId", () => {
  it("throw sur un sqlId inconnu", () => {
    expect(() => getColIdFromSqlId(99)).toThrow("sqlId inconnu : 99");
  });
});

describe("getColumnId et getColIdFromSqlId", () => {
  it("sont des fonctions inverses (round-trip)", () => {
    for (const id of COLUMN_IDS) {
      expect(getColIdFromSqlId(getColumnId(id))).toBe(id);
    }
  });
});
