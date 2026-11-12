import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  changeLanguageMock,
  getSessionMock,
  handleMock,
  mutateAsyncMock,
  useAuthMock,
  useGeneralSettingsMock,
  useUpdateSettingsMock,
} = vi.hoisted(() => ({
  changeLanguageMock: vi.fn(),
  getSessionMock: vi.fn(),
  handleMock: vi.fn(),
  mutateAsyncMock: vi.fn(),
  useAuthMock: vi.fn(),
  useGeneralSettingsMock: vi.fn(),
  useUpdateSettingsMock: vi.fn(),
}));

vi.mock("@/src/features/i18n", () => ({
  default: { changeLanguage: changeLanguageMock },
}));

vi.mock("@/src/features/settings/hooks/useSettingsApi", () => ({
  useGeneralSettings: useGeneralSettingsMock,
  useUpdateSettings: useUpdateSettingsMock,
}));

vi.mock("@/src/shared/hooks/useAsyncHandler", () => ({
  useAsyncHandler: () => ({
    isSaving: false,
    handle: handleMock,
  }),
}));

vi.mock("@/src/shared/hooks/useAuth", () => ({
  useAuth: useAuthMock,
}));

vi.mock("@/src/shared/lib/client", () => ({
  authClient: {
    useSession: {
      get: getSessionMock,
    },
  },
}));

import { useSettings } from "../useSettings";

const serverSettings = {
  theme: "dark" as const,
  emailNotifications: false,
  language: "en" as const,
};

beforeEach(() => {
  vi.clearAllMocks();
  useAuthMock.mockReturnValue({
    user: {
      name: "Alice",
      email: "alice@example.com",
      avatar: "",
    },
  });
  useGeneralSettingsMock.mockReturnValue({ settings: serverSettings });
  useUpdateSettingsMock.mockReturnValue({ mutateAsync: mutateAsyncMock });
  getSessionMock.mockReturnValue({
    data: { session: { providerId: "credential" } },
  });
  mutateAsyncMock.mockResolvedValue(null);
  handleMock.mockImplementation(async (operation: () => Promise<unknown>) => {
    await operation();
  });
});

describe("useSettings", () => {
  it("initializes editable settings from the server", () => {
    const { result } = renderHook(() => useSettings(true));

    expect(result.current.language).toBe("en");
    expect(result.current.emailNotifications).toBe(false);
    expect(result.current.email).toBe("alice@example.com");
    expect(result.current.isProfileDirty).toBe(false);
    expect(useGeneralSettingsMock).toHaveBeenCalledWith(true);
  });

  it("persists a language change and applies it immediately", () => {
    const { result } = renderHook(() => useSettings(true));

    act(() => {
      result.current.setLanguage("fr");
    });

    expect(result.current.language).toBe("fr");
    expect(changeLanguageMock).toHaveBeenCalledWith("fr");
    expect(mutateAsyncMock).toHaveBeenCalledWith({ language: "fr" });
  });

  it("persists email notification changes", () => {
    const { result } = renderHook(() => useSettings(true));

    act(() => {
      result.current.setEmailNotifications(true);
    });

    expect(result.current.emailNotifications).toBe(true);
    expect(mutateAsyncMock).toHaveBeenCalledWith({
      emailNotifications: true,
    });
  });

  it("marks the profile as dirty when the email changes", () => {
    const { result } = renderHook(() => useSettings(true));

    act(() => {
      result.current.setEmail("new@example.com");
    });

    expect(result.current.isProfileDirty).toBe(true);
  });

  it("identifies OAuth sessions", () => {
    getSessionMock.mockReturnValue({
      data: { session: { providerId: "google" } },
    });

    const { result } = renderHook(() => useSettings(false));

    expect(result.current.isOAuth).toBe(true);
  });
});
