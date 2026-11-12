import { beforeEach, describe, expect, it, vi } from "vitest";

const { getSettingsRequest, patchSettingsRequest, handleResponseMock } =
  vi.hoisted(() => ({
    getSettingsRequest: vi.fn(),
    patchSettingsRequest: vi.fn(),
    handleResponseMock: vi.fn(),
  }));

vi.mock("@/src/shared/lib/client", () => ({
  client: {
    api: {
      v1: {
        setting: {
          getSettings: { $get: getSettingsRequest },
          patchSettings: { $patch: patchSettingsRequest },
        },
      },
    },
  },
}));

vi.mock("@/src/shared/api/handleResponse", () => ({
  handleResponse: handleResponseMock,
}));

import { getSettings, patchSettings } from "../settings";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("settings API", () => {
  it("returns the settings received from the server", async () => {
    const response = { ok: true };
    const settings = {
      theme: "dark" as const,
      emailNotifications: true,
      language: "en" as const,
    };
    getSettingsRequest.mockResolvedValue(response);
    handleResponseMock.mockResolvedValue(settings);

    await expect(getSettings()).resolves.toEqual(settings);

    expect(getSettingsRequest).toHaveBeenCalledOnce();
    expect(handleResponseMock).toHaveBeenCalledWith(
      response,
      "Impossible de récupérer les réglages",
      "setting/get",
      expect.anything(),
    );
  });

  it("uses default settings when the server returns an empty body", async () => {
    getSettingsRequest.mockResolvedValue({ ok: true });
    handleResponseMock.mockResolvedValue(null);

    await expect(getSettings()).resolves.toEqual({
      theme: "system",
      emailNotifications: false,
      language: "en",
    });
  });

  it("sends only supported fields when patching settings", async () => {
    const response = { ok: true };
    const patch = {
      theme: "light" as const,
      unexpectedField: "ignored",
    };
    patchSettingsRequest.mockResolvedValue(response);
    handleResponseMock.mockResolvedValue(null);

    await expect(patchSettings(patch)).resolves.toBeNull();

    expect(patchSettingsRequest).toHaveBeenCalledWith({
      json: { theme: "light" },
    });
  });

  it("rejects unsupported theme values before making a request", async () => {
    const patch = { theme: "sepia" } as never;

    await expect(patchSettings(patch)).rejects.toThrow();
    expect(patchSettingsRequest).not.toHaveBeenCalled();
  });
});
