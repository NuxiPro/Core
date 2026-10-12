import { handleResponse } from "@/src/shared/api/handleResponse";
import { client } from "@/src/shared/lib/client";

export interface ProfileUpdate {
  name?: string;
  image?: string;
}

/** Met à jour le profil utilisateur (PATCH) */
export const updateProfile = async (data: ProfileUpdate) => {
  const response =
    await // biome-ignore lint/suspicious/noExplicitAny: setting routes not yet in backend type
    (client as any).api.v1.setting.profile.$patch({
      json: data,
    });

  return await handleResponse<unknown>(
    response,
    "Impossible de mettre à jour le profil",
    "setting/update-profile",
  );
};
