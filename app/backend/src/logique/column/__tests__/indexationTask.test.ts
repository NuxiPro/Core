import { describe, expect, it } from "bun:test";
import { generateKeyBetween } from "fractional-indexing";

function expectBetween(prev: string | null, next: string | null) {
  const result = generateKeyBetween(prev, next);
  if (prev !== null) expect(result > prev).toBe(true);
  if (next !== null) expect(result < next).toBe(true);
  return result;
}

describe("fractional-indexing (generateKeyBetween)", () => {
  it("generates a position when no position exists (null, null)", () => {
    const result = generateKeyBetween(null, null);
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("generates a position BEFORE when prev=null", () => {
    const base = generateKeyBetween(null, null);
    const result = generateKeyBetween(null, base);
    expect(result < base).toBe(true);
  });

  it("generates a position AFTER when next=null", () => {
    const base = generateKeyBetween(null, null);
    const result = generateKeyBetween(base, null);
    expect(result > base).toBe(true);
  });

  it("generates a position BETWEEN two positions", () => {
    const a = generateKeyBetween(null, null);
    const b = generateKeyBetween(a, null);
    const result = generateKeyBetween(a, b);
    expect(result > a).toBe(true);
    expect(result < b).toBe(true);
  });

  it("generates unique positions for consecutive calls", () => {
    const a = generateKeyBetween(null, null);
    const b = generateKeyBetween(a, null);
    const pos1 = generateKeyBetween(a, b);
    const pos2 = generateKeyBetween(pos1, b);
    expect(pos1).not.toBe(pos2);
    expect(pos1 > a).toBe(true);
    expect(pos2 > pos1).toBe(true);
    expect(pos2 < b).toBe(true);
  });

  it("always respects the prev < result < next invariant", () => {
    expectBetween(null, null);
    const a = generateKeyBetween(null, null);
    expectBetween(null, a);
    expectBetween(a, null);
    const b = generateKeyBetween(a, null);
    expectBetween(a, b);
  });

  it("handles a long sequence of insertions", () => {
    let pos = generateKeyBetween(null, null);
    const positions = [pos];
    for (let i = 0; i < 20; i++) {
      pos = generateKeyBetween(pos, null);
      positions.push(pos);
    }
    // Check that the list is sorted
    for (let i = 1; i < positions.length; i++) {
      expect(positions[i] > positions[i - 1]).toBe(true);
    }
  });
});
