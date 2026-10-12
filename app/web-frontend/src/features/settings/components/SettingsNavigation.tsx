import { CircleUser, Settings, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { SettingsTab, SettingsTabConfig } from "../types";
import { ScrollIndicator } from "./ScrollIndicator";

const TAB_ICONS: Record<SettingsTab, React.ReactNode> = {
  general: <Settings />,
  profile: <CircleUser />,
  security: <ShieldCheck />,
};

interface SettingsNavigationProps {
  activeTab: SettingsTab;
  onTabChange: (tab: SettingsTab) => void;
}

const TAB_IDS: SettingsTab[] = ["general", "profile", "security"];

export function SettingsNavigation({
  activeTab,
  onTabChange,
}: SettingsNavigationProps) {
  const { t } = useTranslation();

  const TABS: SettingsTabConfig[] = TAB_IDS.map((id) => {
    const key = `settings.${id}`;
    return {
      id,
      label: t(`${key}.label`),
      icon: TAB_ICONS[id],
      description: t(`${key}.description`),
    };
  });

  return (
    <nav className="w-[240px] shrink-0 border-r border-border h-full overflow-hidden">
      <ScrollIndicator className="h-full">
        <div className="p-4">
          <div className="space-y-0.5">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                  activeTab === tab.id
                    ? "bg-primary/10 text-primary dark:bg-primary/15 dark:text-primary-hover"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <div
                  className={`flex items-center justify-center size-7 rounded-md transition-colors duration-150 ${
                    activeTab === tab.id
                      ? "bg-primary/15 text-primary dark:bg-primary/20 dark:text-primary-hover"
                      : "text-muted-foreground"
                  }`}
                >
                  {tab.icon}
                </div>
                <div className="flex-1 text-left">
                  <p
                    className={`font-medium ${activeTab === tab.id ? "text-primary dark:text-primary-hover" : ""}`}
                  >
                    {tab.label}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {tab.description}
                  </p>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-8 pt-4 border-t border-border">
            <div className="flex items-center gap-2 px-3">
              <div className="size-1.5 rounded-full bg-primary" />
              <span className="text-[11px] text-muted-foreground">
                NexiPro v1.0
              </span>
            </div>
          </div>
        </div>
      </ScrollIndicator>
    </nav>
  );
}
