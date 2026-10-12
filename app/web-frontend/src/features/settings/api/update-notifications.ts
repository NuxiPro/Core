import { handleResponse } from "@/src/shared/api/handleResponse";
import { client } from "@/src/shared/lib/client";

export interface NotificationSettings {
  emailNotifications: boolean;
}

/** Récupère les préférences de notifications */
export const getNotificationSettings =
  async (): Promise<NotificationSettings> => {
    const response =
      await // biome-ignore lint/suspicious/noExplicitAny: setting routes not yet in backend type
      (client as any).api.v1.setting.notifications.$get();

    return await handleResponse<NotificationSettings>(
      response,
      "Impossible de récupérer les notifications",
      "setting/get-notifications",
    );
  };

/** Met à jour les préférences de notifications (PATCH) */
export const updateNotificationSettings = async (
  settings: Partial<NotificationSettings>,
): Promise<NotificationSettings> => {
  const response =
    await // biome-ignore lint/suspicious/noExplicitAny: setting routes not yet in backend type
    (client as any).api.setting.notifications.$patch({
      json: settings,
    });

  return await handleResponse<NotificationSettings>(
    response,
    "Impossible de mettre à jour les notifications",
    "setting/update-notifications",
  );
};
