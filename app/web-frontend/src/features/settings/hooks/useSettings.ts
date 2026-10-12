import { useCallback, useEffect, useMemo, useState } from "react";
import i18n from "@/src/features/i18n";
import { updateProfile } from "@/src/features/settings/api";
import {
  useGeneralSettings,
  useNotificationSettings,
} from "@/src/features/settings/hooks/useSettingsApi";
import { useAsyncHandler } from "@/src/shared/hooks/useAsyncHandler";
import { useAuth } from "@/src/shared/hooks/useAuth";
import { authClient } from "@/src/shared/lib/client";

export function useSettings(open: boolean) {
  const { user } = useAuth();
  const [saveMessage, setSaveMessage] = useState("");

  const showSuccess = useCallback((msg?: string) => {
    setSaveMessage(msg || i18n.t("settings.saved"));
    setTimeout(() => setSaveMessage(""), 3000);
  }, []);
  const showError = useCallback((msg: string) => {
    setSaveMessage(`Error: ${msg}`);
    setTimeout(() => setSaveMessage(""), 3000);
  }, []);

  const { isSaving, handle } = useAsyncHandler({
    onSuccess: showSuccess,
    onError: showError,
  });

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");

  const { settings: generalSettings, update: updateGeneral } =
    useGeneralSettings(open);
  const { settings: notifSettings, update: updateNotifications } =
    useNotificationSettings(open);

  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [language, setLanguage] = useState("fr");
  const [timezone, setTimezone] = useState("Europe/Paris");
  const [emailNotifications, setEmailNotifications] = useState(true);

  useEffect(() => {
    if (generalSettings) {
      setProjectName(generalSettings.projectName);
      setProjectDescription(generalSettings.projectDescription);
      setLanguage(generalSettings.language);
      setTimezone(generalSettings.timezone);
    }
  }, [generalSettings]);

  useEffect(() => {
    if (notifSettings) setEmailNotifications(notifSettings.emailNotifications);
  }, [notifSettings]);

  useEffect(() => {
    if (user && !name && !email) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [user, name, email]);

  const isGeneralDirty = useMemo(
    () =>
      generalSettings
        ? projectName !== generalSettings.projectName ||
          projectDescription !== generalSettings.projectDescription ||
          language !== generalSettings.language ||
          timezone !== generalSettings.timezone
        : false,
    [projectName, projectDescription, language, timezone, generalSettings],
  );
  const isNotificationsDirty = useMemo(
    () =>
      notifSettings
        ? emailNotifications !== notifSettings.emailNotifications
        : false,
    [emailNotifications, notifSettings],
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

  const handleSaveGeneral = () =>
    handle(async () => {
      const tasks = [];
      if (isGeneralDirty)
        tasks.push(
          updateGeneral({
            projectName,
            projectDescription,
            language,
            timezone,
          }),
        );
      if (isNotificationsDirty)
        tasks.push(updateNotifications({ emailNotifications }));
      if (tasks.length) await Promise.all(tasks);
    });

  const handleSaveProfile = () => handle(() => updateProfile({ name }));

  return {
    user,
    isOAuth,
    isSaving,
    saveMessage,
    isGeneralDirty: isGeneralDirty || isNotificationsDirty,
    isProfileDirty,
    name,
    setName,
    email,
    setEmail,
    projectName,
    setProjectName,
    projectDescription,
    setProjectDescription,
    language,
    setLanguage,
    timezone,
    setTimezone,
    emailNotifications,
    setEmailNotifications,
    handleSaveGeneral,
    handleSaveProfile,
  };
}
