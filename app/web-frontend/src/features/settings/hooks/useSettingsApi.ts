import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSettings, patchSettings, type UserSettings } from "../api/settings";

/**
 * Options UNIQUES de la query `["settings"]` — source de vérité des options
 * partagée par tous les observers (modale, dashboard). TanStack réécrit les
 * options de la query au dernier `setOptions` rendu : si les observers
 * divergent (staleTime différent, …), le comportement devient dépendant de
 * l'ordre de montage. En partageant ce même objet, l'ordre n'a plus d'effet.
 */
export const settingsQueryBase = {
  queryKey: ["settings"],
  queryFn: getSettings,
  // Cache jamais stale : une fois les réglages chargés, aucun GET ne repart
  // tant qu'aucune modification n'a eu lieu. La seule re-synchronisation
  // passe par `useUpdateSettings`, qui invalide ce cache après le PATCH
  // → exactement un GET en plus par modification.
  staleTime: Infinity,
  gcTime: Infinity,
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
} as const;

export function useSettingsQuery(open: boolean) {
  return useQuery({
    ...settingsQueryBase,
    enabled: open,
    placeholderData: keepPreviousData,
  });
}

/**
 * POST/GET pairing : le PATCH modifie le serveur, puis invalide `["settings"]`.
 * invalidateQueries marque le cache stale → refetch de la requête active →
 * UN seul GET de re-synchronisation (les invalidations répétées sont
 * dé-dupliquées par TanStack Query).
 */
export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: patchSettings,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["settings"] }),
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
