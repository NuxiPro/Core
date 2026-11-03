import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import i18n from "@/src/features/i18n";
import { settingsQueryBase } from "@/src/features/settings/hooks/useSettingsApi";
import type { UserSettings } from "@/src/features/settings/api";

/**
 * Synchronise la langue de l'app avec les réglages DB.
 * Partage l'entrée de cache unique `["settings"]` — ET les options de query
 * (`settingsQueryBase`) pour que l'ordre de montage des observers soit sans
 * conséquence (sinon : war des options, refetch non déterministes).
 */
export function useSyncLanguage() {
  const { data: language } = useQuery({
    ...settingsQueryBase,
    select: (s: UserSettings) => s.language,
  });

  useEffect(() => {
    if (language && language !== i18n.language) {
      i18n.changeLanguage(language);
    }
  }, [language]);
}
