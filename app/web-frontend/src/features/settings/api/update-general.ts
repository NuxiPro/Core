import { handleResponse } from "@/src/shared/api/handleResponse";
import { client } from "@/src/shared/lib/client";

export interface GeneralSettings {
  projectName: string;
  projectDescription: string;
  language: string;
  timezone: string;
}

/** Récupère les paramètres généraux du projet */
export const getGeneralSettings = async (): Promise<GeneralSettings> => {
  const response =
    await // biome-ignore lint/suspicious/noExplicitAny: setting routes not yet in backend type
    (client as any).api.v1.setting.general.$get();

  return await handleResponse<GeneralSettings>(
    response,
    "Impossible de récupérer les paramètres",
    "setting/get-general",
  );
};

/** Met à jour les paramètres généraux du projet (PATCH) */
export const updateGeneralSettings = async (
  settings: Partial<GeneralSettings>,
): Promise<GeneralSettings> => {
  const response =
    await // biome-ignore lint/suspicious/noExplicitAny: setting routes not yet in backend type
    (client as any).api.setting.general.$patch({
      json: settings,
    });

  return await handleResponse<GeneralSettings>(
    response,
    "Impossible de mettre à jour les paramètres",
    "setting/update-general",
  );
};
