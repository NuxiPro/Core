import { describe, expect, it } from "vitest";
import { LoginSchema, RegisterSchema } from "../auth-schemas";

describe("LoginSchema", () => {
  it("accepts a valid email", () => {
    const result = LoginSchema.safeParse({ email: "user@example.com" });
    expect(result.success).toBe(true);
  });

  it("rejects an empty email with 'Email requis'", () => {
    const result = LoginSchema.safeParse({ email: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Email requis");
    }
  });

  it("rejects an invalid email with 'Email invalide'", () => {
    const result = LoginSchema.safeParse({ email: "not-an-email" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Email invalide");
    }
  });
});

describe("RegisterSchema", () => {
  it("accepts a valid email", () => {
    const result = RegisterSchema.safeParse({ email: "alice@example.com" });
    expect(result.success).toBe(true);
  });

  it("rejects an empty email with 'Email requis'", () => {
    const result = RegisterSchema.safeParse({ email: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Email requis");
    }
  });

  it("rejects an invalid email with 'Email invalide'", () => {
    const result = RegisterSchema.safeParse({ email: "not-an-email" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Email invalide");
    }
  });
});
