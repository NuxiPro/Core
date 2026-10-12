// Exporte centralisé de tous les appels API pour les paramètres

export type { GeneralSettings } from "./update-general";
export { getGeneralSettings, updateGeneralSettings } from "./update-general";
export type { NotificationSettings } from "./update-notifications";
export {
  getNotificationSettings,
  updateNotificationSettings,
} from "./update-notifications";
export type { ProfileUpdate } from "./update-profile";
export { updateProfile } from "./update-profile";
