// biome-ignore-all lint/suspicious/noConsole: These tests verify safe API error output.
import { beforeEach, describe, expect, it, vi } from "vitest";
import { handleResponse } from "../handleResponse";

function mockResponse(body: unknown, ok: boolean, status = 200): Response {
  return { ok, status, json: async () => body } as Response;
}

beforeEach(function resetMocks() {
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("handleResponse", function handleResponseSuite() {
  it("returns parsed body when response.ok is true", async function returnsBody() {
    const body = { success: true, data: { id: "1" } };
    const result = await handleResponse(mockResponse(body, true), "fallback");
    expect(result).toEqual(body);
    expect(console.error).not.toHaveBeenCalled();
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

  it("logs only the request context and status when response is not ok", async function logsError() {
    const body = { message: "Erreur" };
    await expect(
      handleResponse(mockResponse(body, false, 500), "fallback", "ctx/test"),
    ).rejects.toThrow();
    expect(console.error).toHaveBeenCalledWith("API request failed", {
      context: "ctx/test",
      status: 500,
    });
  });

  it("does not log the response body", async function noUserDataInLogs() {
    const body = { message: "Erreur", title: "Donnée sensible" };
    await expect(
      handleResponse(mockResponse(body, false, 500), "fallback", "ctx/test"),
    ).rejects.toThrow();
    expect(JSON.stringify(vi.mocked(console.error).mock.calls)).not.toContain(
      "Donnée sensible",
    );
  });
});
