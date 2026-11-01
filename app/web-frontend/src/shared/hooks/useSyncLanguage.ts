import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import i18n from "@/src/features/i18n";
import { getSettings } from "@/src/features/settings/api";

/**
 * Synchronise la langue de l'app avec les réglages DB.
 * Partage l'entrée de cache unique `["settings"]` (payload-fat, §3.2 doc 08).
 */
export function useSyncLanguage() {
  const { data: language } = useQuery({
    queryKey: ["settings"],
    queryFn: getSettings,
    select: (s) => s.language,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: false,
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (language && language !== i18n.language) {
      i18n.changeLanguage(language);
    }
  }, [language]);
}
