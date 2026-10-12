import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { GeneralSettings } from "../api/update-general";
import {
  getGeneralSettings,
  updateGeneralSettings,
} from "../api/update-general";
import type { NotificationSettings } from "../api/update-notifications";
import {
  getNotificationSettings,
  updateNotificationSettings,
} from "../api/update-notifications";

/** Hook pour les paramètres généraux — lazy loading + cache */
export function useGeneralSettings(open: boolean) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<GeneralSettings>({
    queryKey: ["settings", "general"],
    queryFn: getGeneralSettings,
    enabled: open,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: false,
    placeholderData: keepPreviousData,
    select: (raw) => ({
      projectName: raw.projectName,
      projectDescription: raw.projectDescription,
      language: raw.language,
      timezone: raw.timezone,
    }),
  });

  const update = useMutation({
    mutationFn: (settings: Partial<GeneralSettings>) =>
      updateGeneralSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings", "general"] });
    },
  });

  return {
    settings: data,
    isLoading,
    update: update.mutateAsync,
  };
}

/** Hook pour les notifications — lazy loading + cache */
export function useNotificationSettings(open: boolean) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<NotificationSettings>({
    queryKey: ["settings", "notifications"],
    queryFn: getNotificationSettings,
    enabled: open,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: false,
    placeholderData: keepPreviousData,
    select: (raw) => ({
      emailNotifications: raw.emailNotifications,
    }),
  });

  const update = useMutation({
    mutationFn: (settings: Partial<NotificationSettings>) =>
      updateNotificationSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["settings", "notifications"],
      });
    },
  });

  return {
    settings: data,
    isLoading,
    update: update.mutateAsync,
  };
}
