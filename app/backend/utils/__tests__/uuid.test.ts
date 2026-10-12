import { describe, expect, it } from "bun:test";
import { uuid } from "../uuid";

const UUID_V7_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe("uuid", () => {
  it("retourne un UUID v7 valide", () => {
    expect(uuid()).toMatch(UUID_V7_REGEX);
  });
});
