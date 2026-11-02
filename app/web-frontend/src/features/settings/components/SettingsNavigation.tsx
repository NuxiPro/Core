import { Settings } from "lucide-react";
import { useTranslation } from "react-i18next";

export type SettingsTab = "general" | "profile" | "archiving";

const NAV_ITEMS: Array<{
  id: SettingsTab;
  labelKey: string;
  iconTitle: string;
  path: string;
}> = [
  {
    id: "general",
    labelKey: "settings.tabs.general",
    iconTitle: "Icône général",
    path: "M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4",
  },
  {
    id: "profile",
    labelKey: "settings.tabs.account",
    iconTitle: "Icône compte",
    path: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  },
  {
    id: "archiving",
    labelKey: "settings.tabs.archiving",
    iconTitle: "Icône archivage",
    path: "M5 8h14M5 8a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v1a2 2 0 012 2M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4",
  },
];

export function SettingsNavigation({
  activeTab,
  onTabChange,
}: {
  activeTab: SettingsTab;
  onTabChange: (tab: SettingsTab) => void;
}) {
  const { t } = useTranslation();

  return (
    <aside className="w-56 shrink-0 border-r border-[var(--border)] p-3 space-y-1">
      {/* En-tête de section */}
      <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[var(--text-label)] uppercase tracking-wider">
        <Settings className="size-3.5 shrink-0" />
        <span className="truncate">{t("settings.title")}</span>
      </div>

      {/* Items de navigation */}
      {NAV_ITEMS.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            type="button"
            data-tab={item.id}
            onClick={() => onTabChange(item.id)}
            className={`flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg border-l-2 transition-all duration-150 ${
              isActive
                ? "bg-[var(--surface-hover)] text-emerald-600 dark:text-emerald-400 border-emerald-500"
                : "bg-transparent text-[var(--text-label)] border-transparent hover:bg-[var(--surface-hover)]/80 hover:text-[var(--text-primary)]"
            }`}
          >
            <svg
              className="w-4 h-4 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <title>{item.iconTitle}</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d={item.path}
              />
            </svg>
            <span className="truncate">{t(item.labelKey)}</span>
          </button>
        );
      })}
    </aside>
  );
}
