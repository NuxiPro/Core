import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import i18n from "@/src/features/i18n";
import { getGeneralSettings } from "@/src/features/settings/api";

export function useSyncLanguage() {
  const { data } = useQuery({
    queryKey: ["settings", "general"],
    queryFn: getGeneralSettings,
    enabled: true,
  });

  useEffect(() => {
    if (data?.language && data.language !== i18n.language) {
      i18n.changeLanguage(data.language);
    }
  }, [data]);
}
