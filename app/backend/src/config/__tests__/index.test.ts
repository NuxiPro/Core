import { describe, expect, it } from "bun:test";
import { getColIdFromSqlId, getColumnId } from "../index";

const COLUMN_IDS = ["todo", "In_Progress", "Done"] as const;

describe("getColumnId", () => {
  it("returns a numeric sqlId for each valid ColumnId", () => {
    for (const id of COLUMN_IDS) {
      const sqlId = getColumnId(id);
      expect(typeof sqlId).toBe("number");
    }
  });

  it("throws on an unknown key", () => {
    // @ts-expect-error — runtime test
    expect(() => getColumnId("inconnue")).toThrow(
      "Colonne inconnue : inconnue",
    );
  });
});

describe("getColIdFromSqlId", () => {
  it("throws on an unknown sqlId", () => {
    expect(() => getColIdFromSqlId(99)).toThrow("sqlId inconnu : 99");
  });
});

describe("getColumnId et getColIdFromSqlId", () => {
  it("are inverse functions (round-trip)", () => {
    for (const id of COLUMN_IDS) {
      expect(getColIdFromSqlId(getColumnId(id))).toBe(id);
    }
  });
});
