import { useState } from "react";
import { useSettings } from "../hooks/useSettings";
import { useTranslation } from "react-i18next";
import { SettingsNavigation } from "./SettingsNavigation";
import { ArchivingTab } from "./tabs/ArchivingTab";
import { GeneralTab } from "./tabs/GeneralTab";
import { ProfileTab } from "./tabs/ProfileTab";
import { SecurityTab } from "./tabs/SecurityTab";

/**
 * SettingsPage – refactored design based on the static `setting.html` template.
 * It replaces the previous modal dialog with a full‑page layout that mirrors the
 * HTML/CSS of the design file (grid with a 180 px sidebar and a main content area).
 */
export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<
    "general" | "profile" | "archiving" | "security"
  >("general");
  const settings = useSettings(true);
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-center min-h-screen bg-dark-bg p-2 sm:p-6">
      <div className="w-full max-w-5xl bg-dark-surface border border-dark-border rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[640px] max-h-[90vh]">
        {/* Sidebar */}
        <SettingsNavigation activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab)} />
        {/* Main Content */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-dark-surface">
          {/* Tab Sections */}
          <section
            id="tab-general"
            className={`tab-content ${activeTab === "general" ? "active" : ""} space-y-6`}
          >
            <div>
              <h2 className="text-lg font-semibold text-white">
                {t(`settings.${activeTab}.label`)}
              </h2>
              <p className="text-xs text-gray-400">
                {t(`settings.${activeTab}.description`)}
              </p>
            </div>
            <GeneralTab
              language={settings.language}
              setLanguage={settings.setLanguage}
              emailNotifications={settings.emailNotifications}
              setEmailNotifications={settings.setEmailNotifications}
              isSaving={settings.isSaving}
              isDirty={settings.isGeneralDirty}
              onSave={settings.handleSaveGeneral}
            />
          </section>

          <section
            id="tab-account"
            className={`tab-content ${activeTab === "profile" ? "active" : ""} space-y-6`}
          >
            <ProfileTab
              user={settings.user}
              isOAuth={!!settings.isOAuth}
              email={settings.email}
              setEmail={settings.setEmail}
              isSaving={settings.isSaving}
              onSave={settings.handleSaveProfile}
            />
          </section>

          <section
            id="tab-security"
            className={`tab-content ${activeTab === "security" ? "active" : ""} space-y-6`}
          >
            <SecurityTab isOAuth={!!settings.isOAuth} />
          </section>

          <section
            id="tab-archiving"
            className={`tab-content ${activeTab === "archiving" ? "active" : ""} space-y-6`}
          >
            <ArchivingTab />
          </section>

          {/* Tailwind style overrides for tab visibility */}
          <style>
            {`
              .tab-content { display: none; opacity: 0; transform: translateY(4px); transition: opacity 0.2s ease, transform 0.2s ease; }
              .tab-content.active { display: block; opacity: 1; transform: translateY(0); }
            `}
          </style>

          <div className="mt-8 pt-4 border-t border-dark-border flex items-center justify-end space-x-3">
            <button type="button" className="px-4 py-2 rounded-xl text-xs font-medium text-gray-400 hover:text-white hover:bg-dark-hover transition-colors">
              Annuler
            </button>
            <button
              type="button"
              id="save-btn"
              className="px-4 py-2 rounded-xl text-xs font-medium bg-emerald-500 hover:bg-emerald-400 text-dark-bg font-semibold transition-colors shadow-lg shadow-emerald-500/10"
              onClick={() => {
                // delegate save based on active tab
                if (activeTab === "general") settings.handleSaveGeneral();
                else if (activeTab === "profile") settings.handleSaveProfile();
                // archiving, security do not have explicit save in original UI
                // (settings are applied immediately)
              }}
            >
              Enregistrer
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}