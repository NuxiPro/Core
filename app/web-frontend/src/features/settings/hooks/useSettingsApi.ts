import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getSettings, type UserSettings } from "../api/settings";

/**
 * Stratégie « payload-fat » : UNE requête, UNE entrée de cache `["settings"]`.
 * La zone dynamique de chaque onglet n'appelle que des `select` sur ce cache —
 * aucun re-fetch au changement d'onglet (staleTime 10 min).
 */
export function useSettingsQuery(open: boolean) {
  return useQuery({
    queryKey: ["settings"],
    queryFn: getSettings,
    enabled: open,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: false,
    placeholderData: keepPreviousData,
  });
}

/** Tranche « Général » — même cache, projection via data (sélection dans le composant). */
export function useGeneralSettings(open: boolean) {
  const { data: settings, isLoading } = useSettingsQuery(open);
  return { settings, isLoading } satisfies {
    settings: UserSettings | undefined;
    isLoading: boolean;
  };
}
