import { describe, expect, it } from "vitest";
import { COLUMNS } from "../index";
import { COLUMN_IDS, SQL_ID_MAP } from "../index-frontend";

const columnKeys = Object.keys(COLUMNS);
const columnValues = Object.values(COLUMNS);

describe("COLUMNS", () => {
  it("has one entry per key", () => {
    expect(columnKeys.length).toBeGreaterThan(0);
    expect(columnValues.length).toBe(columnKeys.length);
  });

  it("every column has title (string) and sub (string)", () => {
    for (const col of columnValues) {
      expect(typeof col.title).toBe("string");
      expect(col.title.length).toBeGreaterThan(0);
    }
  });

  it("every column has sqlId (positive integer)", () => {
    for (const col of columnValues) {
      expect(typeof col.sqlId).toBe("number");
      expect(col.sqlId).toBeGreaterThanOrEqual(1);
      expect(Number.isInteger(col.sqlId)).toBe(true);
    }
  });

  it("sqlIds are unique", () => {
    const sqlIds = columnValues.map((c) => c.sqlId);
    expect(new Set(sqlIds).size).toBe(sqlIds.length);
  });

  it("sqlIds are sequential starting from 1", () => {
    const sqlIds = columnValues.map((c) => c.sqlId).sort((a, b) => a - b);
    expect(sqlIds).toEqual(sqlIds.map((_, i) => i + 1));
  });
});

describe("SQL_ID_MAP", () => {
  it("has one entry per column", () => {
    expect(Object.keys(SQL_ID_MAP).length).toBe(columnKeys.length);
  });

  it("is the inverse of COLUMNS (sqlId -> key)", () => {
    for (const [key, col] of Object.entries(COLUMNS)) {
      expect(SQL_ID_MAP[col.sqlId]).toBe(key);
    }
  });

  it("all values are valid ColumnId keys", () => {
    for (const val of Object.values(SQL_ID_MAP)) {
      expect(columnKeys).toContain(val);
    }
  });
});

describe("COLUMN_IDS", () => {
  it("contains all column keys", () => {
    expect([...COLUMN_IDS].sort()).toEqual([...columnKeys].sort());
  });

  it("has same length as COLUMNS", () => {
    expect(COLUMN_IDS.length).toBe(columnKeys.length);
  });
});
