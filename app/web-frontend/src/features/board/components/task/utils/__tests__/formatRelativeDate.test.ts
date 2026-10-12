import { describe, expect, it } from "vitest";
import { formatRelativeDate } from "../formatRelativeDate";

describe("formatRelativeDate", () => {
  it("returns empty string for undefined", () => {
    expect(formatRelativeDate(undefined)).toBe("");
  });

  it("returns empty string for empty string", () => {
    expect(formatRelativeDate("")).toBe("");
  });

  it("returns empty string for whitespace only", () => {
    expect(formatRelativeDate("   ")).toBe("");
  });

  it("returns empty string for invalid date string", () => {
    expect(formatRelativeDate("not-a-date")).toBe("");
  });

  it("returns a French relative time for a valid date in the past", () => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const result = formatRelativeDate(oneHourAgo);
    expect(result).not.toBe("");
    expect(result.length).toBeGreaterThan(0);
  });

  it("appends 'Z' to ISO strings without timezone", () => {
    const withoutZ = "2025-01-01T12:00:00";
    const result = formatRelativeDate(withoutZ);
    expect(result).not.toBe("");
  });

  it("returns 'just now' for a very recent date", () => {
    const justNow = new Date(Date.now() - 5000).toISOString();
    expect(formatRelativeDate(justNow)).toBe("just now");
  });

  it("returns 'yesterday' for exactly 1 day ago", () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    expect(formatRelativeDate(yesterday)).toBe("yesterday");
  });
});
