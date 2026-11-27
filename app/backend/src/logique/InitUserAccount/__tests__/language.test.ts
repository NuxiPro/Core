import { afterAll, describe, expect, it, mock } from "bun:test";

mock.module("@backend/src/drizzle/connection", () => ({ db: {} }));
const { toLang } = await import("../01-ensure-default-settings");

afterAll(() => mock.restore());

describe("toLang", () => {
  it("accepts supported languages", () => {
    expect(toLang("fr")).toBe("fr");
    expect(toLang("en")).toBe("en");
  });

  it("falls back to English for unsupported values", () => {
    expect(toLang(null)).toBe("en");
    expect(toLang(undefined)).toBe("en");
    expect(toLang("de")).toBe("en");
    expect(toLang("FR")).toBe("en");
    expect(toLang(42)).toBe("en");
  });
});
