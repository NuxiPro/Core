// Point d'entrée unique des appels API settings — un GET global (stratégie :
// 1 requête côté serveur, découpe par tab côté front).
export {
  getSettings,
  patchSettings,
  isLanguage,
  isTheme,
  LANGUAGES,
  THEMES,
  type UserSettings,
  type UserSettingsPatch,
  type Language,
  type Theme,
} from "./settings";
