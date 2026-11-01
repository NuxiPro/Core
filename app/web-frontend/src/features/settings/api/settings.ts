import { handleResponse } from "@/src/shared/api/handleResponse";
import { client } from "@/src/shared/lib/client";

/**
 * Réglages utilisateur — miroir de `GetSetting` (setting.shemas.ts backend).
 * Source de vérité du type : la route OpenAPI, via `client.api.v1.setting.getSettings`.
 */
export const getSettings = async () => {
  const res = await client.api.v1.setting.getSettings.$get();
  return handleResponse<{
    theme: "light" | "dark" | "system";
    emailNotifications: boolean;
    language: "fr" | "en";
  }>(res, "Impossible de récupérer les réglages", "setting/get");
};

export type UserSettings = Awaited<ReturnType<typeof getSettings>>;
