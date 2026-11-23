import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import i18n from "@/src/features/i18n";
import type {
  ArchiveMode,
  Language,
  UserSettingsPatch,
} from "@/src/features/settings/api/settings";
import {
  useGeneralSettings,
  useUpdateSettings,
} from "@/src/features/settings/hooks/useSettingsApi";
import { useAsyncHandler } from "@/src/shared/hooks/useAsyncHandler";
import { useAuth } from "@/src/shared/hooks/useAuth";
import { authClient } from "@/src/shared/lib/client";

// TEMP (08 §3.2) — la persistance server arrivée avec la route PATCH; en attendant,
// le Save applique les changements localement et le dit honnêtement.
const PATCH_PENDING_MSG =
  "Applied locally — persistance serveur à venir (route PATCH)";

/**
 * État réactif des paramètres : amorcé depuis le serveur (requête unique,
 * cache TanStack), édité localement en temps réel.
 * - Langue, thème, notifications, archivage → application directe (pas de Save).
 * - E-mail → validation manuelle via le footer sticky de la modale.
 */
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

  // Persistance des réglages : PATCH + invalidation du cache → un GET de re-sync
  const updateSettings = useUpdateSettings();
  const saveSettings = useCallback(
    (patch: UserSettingsPatch) =>
      handle(async () => {
        await updateSettings.mutateAsync(patch);
      }),
    [handle, updateSettings],
  );

  // État local éditable, amorcé depuis la DB
  const [language, setLanguageLocal] = useState<Language>("fr");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [email, setEmail] = useState(user?.email || "");
  const [archiveMode, setArchiveModeLocal] = useState<ArchiveMode>("instant");
  const [archiveDelayDays, setArchiveDelayDaysLocal] = useState<number | null>(
    null,
  );

  useEffect(() => {
    if (settings) {
      setLanguageLocal(settings.language);
      setEmailNotifications(settings.emailNotifications);
      setArchiveModeLocal(settings.archiveMode);
      setArchiveDelayDaysLocal(settings.archiveDelayDays);
    }
  }, [settings]);

  // La langue s'applique immédiatement (i18n) puis persiste côté serveur
  const setLanguage = (v: Language) => {
    setLanguageLocal(v);
    i18n.changeLanguage(v);
    saveSettings({ language: v });
  };

  // Le toggle e-mail persiste immédiatement (pas de Save, cohérent avec langue/thème)
  const setEmailNotificationsPersisted = (v: boolean) => {
    setEmailNotifications(v);
    saveSettings({ emailNotifications: v });
  };

  // Archiving applies directly too (PATCH → one GET of re-sync, same as
  // the other settings — nothing loads separately for the tab).
  const setArchiveMode = (v: ArchiveMode) => {
    setArchiveModeLocal(v);
    // Turning the delayed mode on with no delay stored yet: send the
    // default (30 days) along so the select always has a value.
    if (v === "time" && archiveDelayDays === null) {
      setArchiveDelayDaysLocal(30);
      saveSettings({ archiveMode: v, archiveDelayDays: 30 });
      return;
    }
    saveSettings({ archiveMode: v });
  };

  const setArchiveDelayDays = (v: number) => {
    setArchiveDelayDaysLocal(v);
    saveSettings({ archiveDelayDays: v });
  };

  const isProfileDirty = useMemo(
    () => (user ? email !== (user.email || "") : false),
    [email, user],
  );

  const isOAuth = useMemo(() => {
    const session = authClient.useSession.get();
    const providerId = (
      session?.data?.session as unknown as { providerId?: string }
    )?.providerId;
    return !!providerId && providerId !== "credential";
  }, []);

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
    isProfileDirty,
    email,
    setEmail,
    language,
    setLanguage,
    emailNotifications,
    setEmailNotifications: setEmailNotificationsPersisted,
    archiveMode,
    archiveDelayDays,
    setArchiveMode,
    setArchiveDelayDays,
    handleSaveProfile,
  };
}
