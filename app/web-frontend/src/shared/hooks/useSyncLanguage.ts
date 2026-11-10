import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { createLogger } from "@packages/shared/utils/logger";
import i18n from "@/src/features/i18n";
import { settingsQueryBase } from "@/src/features/settings/hooks/useSettingsApi";
import type { UserSettings } from "@/src/features/settings/api";

/**
 * Synchronise la langue de l'app avec les réglages DB.
 * Partage l'entrée de cache unique `["settings"]` — ET les options de query
 * (`settingsQueryBase`) pour que l'ordre de montage des observers soit sans
 * conséquence (sinon : war des options, refetch non déterministes).
 */
const log = createLogger("i18n/settings");

export function useSyncLanguage() {
  const { data: language, error, isPending } = useQuery({
    ...settingsQueryBase,
    select: (s: UserSettings) => s.language,
  });

  useEffect(() => {
    if (isPending) {
      log.debug("Waiting for server settings");
      return;
    }

    if (error) {
      log.error("Failed to retrieve server language", error);
      return;
    }

    log.debug("Language received from server", { language });
    if (language && language !== i18n.language) {
      void i18n.changeLanguage(language);
    }
  }, [error, isPending, language]);
}
