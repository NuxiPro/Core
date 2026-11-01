import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import i18n from "@/src/features/i18n";
import { useGeneralSettings } from "@/src/features/settings/hooks/useSettingsApi";
import { useAsyncHandler } from "@/src/shared/hooks/useAsyncHandler";
import { useAuth } from "@/src/shared/hooks/useAuth";
import { authClient } from "@/src/shared/lib/client";

// TEMP (08 §3.2) — la persistance server arrivée avec la route PATCH; en attendant,
// le Save applique les changements localement et le dit honnêtement.
const PATCH_PENDING_MSG =
  "Applied locally — persistance serveur à venir (route PATCH)";

export function useSettings(open: boolean) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [saveMessage, setSaveMessage] = useState("");

  const showSuccess = useCallback(
    (msg?: string) => {
      setSaveMessage(msg || t("settings.saved"));
      setTimeout(() => setSaveMessage(""), 3000);
    },
    [t],
  );
  const showError = useCallback((msg?: string) => {
    setSaveMessage(`Error: ${msg}`);
    setTimeout(() => setSaveMessage(""), 3000);
  }, []);

  const { isSaving, handle } = useAsyncHandler({
    onSuccess: showSuccess,
    onError: showError,
  });

  // Données serveur — requête unique partagée par tous les onglets
  const { settings } = useGeneralSettings(open);

  // État local éditable, amorcé depuis la DB
  const [language, setLanguageLocal] = useState<string>("fr");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");

  useEffect(() => {
    if (settings) {
      setLanguageLocal(settings.language);
      setEmailNotifications(settings.emailNotifications);
    }
  }, [settings]);

  // La langue s'applique immédiatement (i18n) — la persistance viendra avec PATCH
  const setLanguage = (v: string) => {
    setLanguageLocal(v);
    i18n.changeLanguage(v);
  };

  const isGeneralDirty = useMemo(
    () =>
      settings
        ? language !== settings.language ||
          emailNotifications !== settings.emailNotifications
        : false,
    [language, emailNotifications, settings],
  );
  const isProfileDirty = useMemo(
    () =>
      user ? name !== (user.name || "") || email !== (user.email || "") : false,
    [name, email, user],
  );

  const isOAuth = useMemo(() => {
    const session = authClient.useSession.get();
    const providerId = (
      session?.data?.session as unknown as { providerId?: string }
    )?.providerId;
    return !!providerId && providerId !== "credential";
  }, []);

  // TODO (08 §3.2) : remplacer par client.setting.getSettings.$patch({ json })
  const handleSaveGeneral = () =>
    handle(async () => {
      setSaveMessage(PATCH_PENDING_MSG);
    });

  // TODO: migration vers la route authClient (updateUser) — cf. doc 06 section 07
  const handleSaveProfile = () =>
    handle(async () => {
      setSaveMessage(PATCH_PENDING_MSG);
    });

  return {
    user,
    isOAuth,
    isSaving,
    saveMessage,
    isGeneralDirty,
    isProfileDirty,
    name,
    setName,
    email,
    setEmail,
    language,
    setLanguage,
    emailNotifications,
    setEmailNotifications,
    handleSaveGeneral,
    handleSaveProfile,
  };
}
