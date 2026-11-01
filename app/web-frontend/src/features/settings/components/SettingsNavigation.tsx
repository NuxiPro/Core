import { Settings } from "lucide-react";
import { useTranslation } from "react-i18next";

type SettingsTab = "general" | "profile" | "archiving" | "security";

export function SettingsNavigation({
  activeTab,
  onTabChange,
}: {
  activeTab: SettingsTab;
  onTabChange: (tab: SettingsTab) => void;
}) {
  const _t = useTranslation();

  return (
    <aside className="w-full md:w-64 bg-dark-bg/60 border-b md:border-b-0 md:border-r border-dark-border p-4 flex flex-col justify-between shrink-0">
      <div className="space-y-6">
        {/* Header & Breadcrumb */}
        <div className="px-2 pt-1 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                <Settings />
            </div>
            <span className="font-semibold text-sm text-gray-100 tracking-wide">
              Paramètres
            </span>
          </div>
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
        </div>

        {/* Navigation items list */}
        <nav className="space-y-1" id="sidebar-nav">
          <button
            type="button"
            data-tab="general"
            onClick={() => onTabChange("general")}
            className={`nav-btn w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${activeTab === "general" ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20" : "text-gray-400 hover:text-gray-200 hover:bg-dark-hover border border-transparent"}`}
          >
            <svg
              className="w-4 h-4 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <title>Icône Général</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
              />
            </svg>
            <span>Général</span>
          </button>

          <button
            type="button"
            data-tab="profile"
            onClick={() => onTabChange("profile")}
            className={`nav-btn w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${activeTab === "profile" ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20" : "text-gray-400 hover:text-gray-200 hover:bg-dark-hover border border-transparent"}`}
          >
            <svg
              className="w-4 h-4 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <title>Icône compte</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span>Compte & Profil</span>
          </button>

          <button
            type="button"
            data-tab="archiving"
            onClick={() => onTabChange("archiving")}
            className={`nav-btn w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${activeTab === "archiving" ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20" : "text-gray-400 hover:text-gray-200 hover:bg-dark-hover border border-transparent"}`}
          >
            <svg
              className="w-4 h-4 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <title>Icône archivage</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 8h14M5 8a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v1a2 2 0 012 2M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
              />
            </svg>
            <span>Archivage & Auto</span>
          </button>

          <button
            type="button"
            data-tab="security"
            onClick={() => onTabChange("security")}
            className={`nav-btn w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${activeTab === "security" ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20" : "text-gray-400 hover:text-gray-200 hover:bg-dark-hover border border-transparent"}`}
          >
            <svg
              className="w-4 h-4 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <title>Icône sécurité</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2-2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <span>Sécurité & 2FA</span>
          </button>
        </nav>
      </div>
    </aside>
  );
}
