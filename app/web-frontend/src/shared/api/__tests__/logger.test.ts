import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SentryLike } from "../logger";
import { createLogger } from "../logger";

const sentryMock: SentryLike = {
  captureException: vi.fn(),
  captureMessage: vi.fn(),
};

beforeEach(function resetMocks() {
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "log").mockImplementation(() => {});
});

describe("createLogger", function loggerSuite() {
  it("sends captureException to Sentry when error is an Error instance", function logsException() {
    const log = createLogger("test/ctx", sentryMock);
    const err = new Error("boom");
    log.error("Échec", err);
    expect(sentryMock.captureException).toHaveBeenCalledWith(err, {
      extra: { context: "test/ctx", msg: "Échec" },
    });
  });

  it("sends captureMessage when no Error instance is passed", function logsMessage() {
    const log = createLogger("test/ctx", sentryMock);
    log.error("Échec", undefined, { extra: { foo: "bar" } });
    expect(sentryMock.captureMessage).toHaveBeenCalledWith("Échec", {
      level: "error",
      extra: { context: "test/ctx", detail: undefined, foo: "bar" },
    });
  });

  it("merges sub-context with logger context in fullContext", function mergesContext() {
    const log = createLogger("api", sentryMock);
    log.error("fail", undefined, { context: "matrice/create" });
    expect(sentryMock.captureMessage).toHaveBeenCalledWith("fail", {
      level: "error",
      extra: { context: "api/matrice/create", detail: undefined },
    });
  });

  it("does not throw when sentry is undefined", function noThrowWithoutSentry() {
    const log = createLogger("test/ctx");
    expect(function callError() {
      log.error("Test", new Error("x"));
    }).not.toThrow();
  });

  it("does NOT send warn to Sentry in dev mode (no DSN sampling wasted)", function warnNotSentToSentry() {
    const log = createLogger("test/ctx", sentryMock);
    log.warn("Dev warning", { foo: 1 });
    expect(sentryMock.captureMessage).not.toHaveBeenCalled();
  });
});
