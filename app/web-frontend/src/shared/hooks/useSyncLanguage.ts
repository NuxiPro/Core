// biome-ignore-all lint/suspicious/noConsole: Report language-setting failures during development.
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import i18n from "@/src/features/i18n";
import type { UserSettings } from "@/src/features/settings/api/settings";
import { settingsQueryBase } from "@/src/features/settings/hooks/useSettingsApi";

/**
 * Synchronise la langue de l'app avec les réglages DB.
 * Partage l'entrée de cache unique `["settings"]` — ET les options de query
 * (`settingsQueryBase`) pour que l'ordre de montage des observers soit sans
 * conséquence (sinon : war des options, refetch non déterministes).
 */
export function useSyncLanguage() {
  const {
    data: language,
    error,
    isPending,
  } = useQuery({
    ...settingsQueryBase,
    select: (s: UserSettings) => s.language,
  });

  useEffect(() => {
    if (isPending) {
      return;
    }

    if (error) {
      if (import.meta.env.DEV) {
        console.warn("Failed to retrieve server language");
      }
      return;
    }

    if (language && language !== i18n.language) {
      void i18n.changeLanguage(language);
    }
  }, [error, isPending, language]);
}
