import { useTranslation } from "react-i18next";
import {
  isLanguage,
  type Language,
} from "@/src/features/settings/api/settings";
import { useTheme } from "@/src/shared/hooks/useTheme";

interface GeneralTabProps {
  language: string;
  setLanguage: (v: Language) => void;
  emailNotifications: boolean;
  setEmailNotifications: (v: boolean) => void;
}

/**
 * Onglet « Général » — tout est à mise à jour directe (langue, thème,
 * notifications) : application en temps réel, aucun bouton Save.
 */
export function GeneralTab({
  language,
  setLanguage,
  emailNotifications,
  setEmailNotifications,
}: GeneralTabProps) {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      {/* Carte Préférences */}
      <section
        className="bg-[var(--surface-card)] border border-[var(--border)] rounded-xl p-4 space-y-4"
        aria-label={t("settings.general.preferences")}
      >
        {/* Langue */}
        <div className="flex items-center justify-between py-3 border-b border-[var(--border)]/40 first:pt-0 last:pb-0">
          <div className="space-y-0.5 pr-4">
            <h4
              className="text-sm font-medium text-[var(--text-primary)]"
              id="settings-language-label"
            >
              {t("settings.general.language")}
            </h4>
            <p className="text-xs text-[var(--text-label)]">
              {t("settings.general.languageDesc")}
            </p>
          </div>
          <select
            aria-labelledby="settings-language-label"
            value={language}
            onChange={(e) =>
              isLanguage(e.target.value) && setLanguage(e.target.value)
            }
            className="shrink-0 w-48 bg-[var(--dialog-input-bg)] border border-[var(--dialog-input-border)] rounded-lg px-3 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 hover:border-[var(--border-subtle)] transition-colors"
          >
            <option value="fr">{t("common.french")}</option>
            <option value="en">{t("common.english")}</option>
          </select>
        </div>

        {/* Thème */}
        <div className="flex items-center justify-between py-3 border-b border-[var(--border)]/40 first:pt-0 last:pb-0">
          <div className="space-y-0.5 pr-4">
            <h4 className="text-sm font-medium text-[var(--text-primary)]">
              {t("settings.general.theme")}
            </h4>
            <p className="text-xs text-[var(--text-label)]">
              {t("settings.general.themeDesc")}
            </p>
          </div>
          <div className="shrink-0 grid grid-cols-3 gap-2 w-64">
            {(["light", "dark", "system"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setTheme(value)}
                className={`relative p-2 rounded-lg border transition-colors duration-150 text-left ${
                  theme === value
                    ? "border-emerald-500 bg-emerald-500/5"
                    : "border-[var(--border)] hover:border-[var(--border-subtle)]"
                }`}
              >
                <div
                  className={
                    value === "light"
                      ? "w-full h-7 rounded bg-zinc-100 border border-zinc-300 mb-1.5"
                      : value === "dark"
                        ? "w-full h-7 rounded bg-zinc-950 border border-zinc-800 mb-1.5"
                        : "w-full h-7 rounded bg-gradient-to-r from-zinc-100 to-zinc-950 border border-zinc-600 mb-1.5"
                  }
                />
                <p className="text-xs font-medium text-[var(--text-primary)]">
                  {t(`settings.general.${value}`)}
                </p>
                {theme === value && (
                  <div className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-emerald-500" />
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Carte Notifications */}
      <section
        className="bg-[var(--surface-card)] border border-[var(--border)] rounded-xl p-4 space-y-4"
        aria-label={t("settings.general.notifications")}
      >
        <div className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
          <div className="space-y-0.5 pr-4">
            <h4 className="text-sm font-medium text-[var(--text-primary)]">
              {t("settings.general.emailNotifications")}
            </h4>
            <p className="text-xs text-[var(--text-label)]">
              {t("settings.general.emailNotificationsDesc")}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={emailNotifications}
            aria-label={t("settings.general.emailNotifications")}
            onClick={() => setEmailNotifications(!emailNotifications)}
            className={`shrink-0 w-9 h-5 rounded-full relative transition-colors duration-150 ${
              emailNotifications ? "bg-emerald-500" : "bg-[var(--border)]"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 size-4 rounded-full bg-white transition-transform duration-150 ${
                emailNotifications ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </section>
    </div>
  );
}
