import { beforeEach, describe, expect, it, vi } from "vitest";
import { handleResponse } from "../handleResponse";

const { mockError, mockWarn, mockInfo, mockDebug } = vi.hoisted(() => ({
  mockError: vi.fn(),
  mockWarn: vi.fn(),
  mockInfo: vi.fn(),
  mockDebug: vi.fn(),
}));

vi.mock("../logger", function mockLogger() {
  return {
    createLogger: function createLogger() {
      return {
        error: mockError,
        warn: mockWarn,
        info: mockInfo,
        debug: mockDebug,
      };
    },
  };
});

vi.mock("../sentry", function mockSentry() {
  return {
    Sentry: {},
  };
});

function mockResponse(body: unknown, ok: boolean, status = 200): Response {
  return { ok, status, json: async () => body } as Response;
}

beforeEach(function resetMocks() {
  vi.clearAllMocks();
});

describe("handleResponse", function handleResponseSuite() {
  it("returns parsed body when response.ok is true", async function returnsBody() {
    const body = { success: true, data: { id: "1" } };
    const result = await handleResponse(mockResponse(body, true), "fallback");
    expect(result).toEqual(body);
    expect(mockError).not.toHaveBeenCalled();
  });

  it("throws Error with body.message when response is not ok", async function throwsBodyMessage() {
    const body = { message: "Erreur serveur" };
    await expect(
      handleResponse(mockResponse(body, false, 500), "fallback", "ctx/test"),
    ).rejects.toThrow("Erreur serveur");
  });

  it("throws fallback errorMessage when body has no message", async function throwsFallbackMessage() {
    await expect(
      handleResponse(mockResponse({}, false, 500), "Impossible", "ctx/test"),
    ).rejects.toThrow("Impossible");
  });

  it("calls log.error with context and status when response is not ok", async function logsError() {
    const body = { message: "Erreur" };
    await expect(
      handleResponse(mockResponse(body, false, 500), "fallback", "ctx/test"),
    ).rejects.toThrow();
    expect(mockError).toHaveBeenCalledWith("Erreur", undefined, {
      context: "ctx/test",
      extra: { status: 500 },
    });
  });

  it("does NOT send body in extra (security: no user data)", async function noUserDataInLogs() {
    const body = { message: "Erreur", title: "Donnée sensible" };
    await expect(
      handleResponse(mockResponse(body, false, 500), "fallback", "ctx/test"),
    ).rejects.toThrow();
    const call = mockError.mock.calls[0];
    const meta = call?.[2];
    const extra = meta?.extra;
    expect(extra).not.toHaveProperty("title");
  });
});
