import { useTranslation } from "react-i18next";
import i18n from "@/src/features/i18n";
import { Button } from "@/src/layout/components/ui/button";
import { Input } from "@/src/layout/components/ui/input";
import { Separator } from "@/src/layout/components/ui/separator";
import { useTheme } from "@/src/shared/hooks/useTheme";

interface GeneralTabProps {
  projectName: string;
  setProjectName: (v: string) => void;
  projectDescription: string;
  setProjectDescription: (v: string) => void;
  language: string;
  setLanguage: (v: string) => void;
  timezone: string;
  setTimezone: (v: string) => void;
  emailNotifications: boolean;
  setEmailNotifications: (v: boolean) => void;
  isSaving: boolean;
  isDirty: boolean;
  onSave: () => void;
}

export function GeneralTab({
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
  isSaving,
  isDirty,
  onSave,
}: GeneralTabProps) {
  const { theme, toggle } = useTheme();
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Project */}
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-semibold text-foreground">
            {t("settings.general.project")}
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t("settings.general.information")}
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <label
                htmlFor="project-name"
                className="text-sm font-medium text-foreground"
              >
                {t("settings.general.projectName")}
              </label>
            </div>
            <div className="w-64 shrink-0">
              <Input
                id="project-name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder={t("settings.general.projectNamePlaceholder")}
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <label
                htmlFor="project-desc"
                className="text-sm font-medium text-foreground"
              >
                {t("settings.general.descriptionLabel")}
              </label>
            </div>
            <div className="w-64 shrink-0">
              <textarea
                id="project-desc"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                className="w-full h-16 rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                placeholder={t("settings.general.descriptionPlaceholder")}
              />
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Language & Region */}
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-semibold text-foreground">
            {t("settings.general.languageRegion")}
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t("settings.general.preferences")}
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <label
              htmlFor="language"
              className="text-sm font-medium text-foreground"
            >
              {t("settings.general.language")}
            </label>
            <div className="w-48 shrink-0">
              <select
                id="language"
                value={language}
                onChange={(e) => {
                  setLanguage(e.target.value);
                  i18n.changeLanguage(e.target.value);
                }}
                className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="fr">{t("common.french")}</option>
                <option value="en">{t("common.english")}</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <label
              htmlFor="timezone"
              className="text-sm font-medium text-foreground"
            >
              {t("settings.general.timezone")}
            </label>
            <div className="w-48 shrink-0">
              <select
                id="timezone"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="Europe/Paris">Europe/Paris (UTC+1)</option>
                <option value="UTC">UTC</option>
                <option value="America/New_York">
                  America/New_York (UTC-5)
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Appearance */}
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-semibold text-foreground">
            {t("settings.general.appearance")}
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t("settings.general.theme")}
          </p>
        </div>

        <div className="flex items-center justify-between gap-4">
          <span className="text-sm font-medium text-foreground">
            {t("settings.general.theme")}
          </span>
          <div className="w-64 shrink-0 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={toggle}
              className={`relative p-2.5 rounded-lg border transition-colors duration-150 text-left ${
                theme === "light"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-muted-foreground/30"
              }`}
            >
              <div className="w-full h-8 rounded bg-white border border-border mb-1.5" />
              <p className="text-xs font-medium text-foreground">
                {t("settings.general.light")}
              </p>
              {theme === "light" && (
                <div className="absolute top-2 right-2 size-1.5 rounded-full bg-primary" />
              )}
            </button>

            <button
              type="button"
              onClick={toggle}
              className={`relative p-2.5 rounded-lg border transition-colors duration-150 text-left ${
                theme === "dark"
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-muted-foreground/30"
              }`}
            >
              <div className="w-full h-8 rounded bg-[#010102] border border-[#23252a] mb-1.5" />
              <p className="text-xs font-medium text-foreground">
                {t("settings.general.dark")}
              </p>
              {theme === "dark" && (
                <div className="absolute top-2 right-2 size-1.5 rounded-full bg-primary" />
              )}
            </button>
          </div>
        </div>
      </div>

      <Separator />

      {/* Notifications */}
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-semibold text-foreground">
            {t("settings.general.notifications")}
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t("settings.general.channels")}
          </p>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">
              {t("settings.general.emailNotifications")}
            </p>
            <p className="text-xs text-muted-foreground">
              {t("settings.general.emailNotificationsDesc")}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setEmailNotifications(!emailNotifications)}
            className={`w-9 h-5 rounded-full border relative transition-colors duration-150 shrink-0 ${emailNotifications ? "bg-primary border-primary" : "bg-muted border-border"}`}
          >
            <div
              className={`absolute top-0.5 size-4 rounded-full shadow-sm transition-all duration-150 ${emailNotifications ? "left-[18px] bg-white" : "left-0.5 bg-muted-foreground/50"}`}
            />
          </button>
        </div>
      </div>

      <Separator />

      {/* Save */}
      <div className="flex items-center justify-end">
        <Button onClick={onSave} disabled={isSaving || !isDirty}>
          {isSaving ? t("settings.saving") : t("settings.save")}
        </Button>
      </div>
    </div>
  );
}
