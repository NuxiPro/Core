import { describe, expect, it } from "bun:test";
import { createLogger } from "../logger";

describe("backend logger", () => {
  it("allows an explicitly enabled production info message", () => {
    const records: unknown[] = [];
    const log = createLogger("server", "INFO");
    log.attachTransport((record) => {
      records.push(record);
    });

    log.info("Server online", { port: 8080 });

    const line = JSON.stringify(records);
    expect(line).toContain('"logLevelName":"INFO"');
    expect(line).toContain("Server online");
    expect(line).toContain('"port":8080');
  });

  it("keeps the ALERT level and masks sensitive values", () => {
    const token = "secret-token-value";
    const records: unknown[] = [];
    const log = createLogger("security");
    log.attachTransport((record) => {
      records.push(record);
    });

    log.alert(
      "Repeated refusal from user@example.com token=secret-token-value",
      {
        token,
        email: "user@example.com",
      },
    );

    const line = JSON.stringify(records);
    expect(line).toContain("ALERT");
    expect(line).toContain("[REDACTED]");
    expect(line).not.toContain(token);
    expect(line).not.toContain("user@example.com");
  });
});
