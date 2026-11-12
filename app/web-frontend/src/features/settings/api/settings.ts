import { z } from "zod";
import { handleResponse } from "@/src/shared/api/handleResponse";
import { client } from "@/src/shared/lib/client";

/** Langues supportées — miroir de `GetSetting` backend. */
export const LANGUAGES = ["fr", "en"] as const;
export type Language = (typeof LANGUAGES)[number];

/**
 * Réglages utilisateur — miroir de `GetSetting` (setting.shemas.ts backend).
 * Type explicite (pas de dérivation depuis getSettings : circularité TS).
 */
export type UserSettings = {
  theme: "light" | "dark" | "system";
  emailNotifications: boolean;
  language: Language;
};

/** Défauts de dernier recours si le serveur est indisponible. Le serveur reste prioritaire via useSyncLanguage. */
const DEFAULT_SETTINGS: UserSettings = {
  theme: "system",
  emailNotifications: false,
  language: "en",
};

/** GET /getSettings */
export const getSettings = async (): Promise<UserSettings> => {
  const res = await client.api.v1.setting.getSettings.$get();
  // Body vide éventuel → UserSettings | null (null = benin, pas de log)
  const parsed = await handleResponse<UserSettings | null>(
    res,
    "Impossible de récupérer les réglages",
    "setting/get",
    SettingsSchema,
  );
  return parsed ?? DEFAULT_SETTINGS;
};

/** PATCH /patchSettings */
export const patchSettings = async (patch: UserSettingsPatch): Promise<null> => {
  // Sanitize : ce qui part sur le réseau est strictement limité aux clés connues
  const clean = SettingsPatchSchema.parse(patch);
  const res = await client.api.v1.setting.patchSettings.$patch({ json: clean });
  // La réponse du PATCH n'est pas consumée : le cache est re-synchronisé
  // par invalidation (un seul GET dans le sillage du PATCH).
  return handleResponse<null>(
    res,
    "Impossible de mettre à jour les réglages",
    "setting/patch",
  );
};

/** Garde de type pour restreindre une chaîne non typée (DOM, i18n) à `Language`. */
export const isLanguage = (v: string): v is Language =>
  LANGUAGES.includes(v as Language);

/** Thèmes supportés — miroir de `GetSetting` backend ("system" suit l'OS). */
export const THEMES = ["light", "dark", "system"] as const;
export type Theme = (typeof THEMES)[number];
export const isTheme = (v: string): v is Theme => THEMES.includes(v as Theme);
export type UserSettingsPatch = Partial<UserSettings>;

/**
 * Schémas de la frontière réseau — les enums dérivent de LANGUAGES/THEMES
 * (chaque champ ajouté au backend se propage compilateur inclut).
 * Réponse : `strictObject` — clé inconnue = rejetée, pas de donnée fantôme.
 * Patch : `.partial()` de zod = strip des clés inconnues → payload whitelisté.
 */
const SettingsSchema = z.strictObject({
  theme: z.enum(THEMES),
  emailNotifications: z.boolean(),
  language: z.enum(LANGUAGES),
});

const SettingsPatchSchema = z
  .object({
    theme: z.enum(THEMES),
    emailNotifications: z.boolean(),
    language: z.enum(LANGUAGES),
  })
  .partial();
