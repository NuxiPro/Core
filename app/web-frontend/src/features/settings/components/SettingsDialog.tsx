import { CheckCircle, X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent } from "@/src/layout/components/ui/dialog";
import { useSettings } from "../hooks/useSettings";
import { ScrollIndicator } from "./ScrollIndicator";
import { SettingsNavigation } from "./SettingsNavigation";
import { GeneralTab } from "./tabs/GeneralTab";
import { ProfileTab } from "./tabs/ProfileTab";
import { SecurityTab } from "./tabs/SecurityTab";
import { ArchivingTab } from "./tabs/ArchivingTab";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const [activeTab, setActiveTab] = useState<
    "general" | "profile" | "archiving" | "security"
  >("general");
  const settings = useSettings(open);
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[90vw] max-h-[90vh] w-full h-full p-0 flex flex-col overflow-hidden bg-background border border-border rounded-xl"
        showCloseButton={false}
      >
        {/* Header minimal */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-border shrink-0">
          <h2 className="text-sm font-semibold text-foreground">
            {t("settings.title")}
          </h2>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
            aria-label={t("settings.close")}
          >
            <X width={15} height={15} strokeWidth={1.5} />
          </button>
        </div>
        <div className="flex-1 flex min-h-0">
          <SettingsNavigation
            activeTab={activeTab}
            onTabChange={(tab) => setActiveTab(tab)}
          />
          <ScrollIndicator className="flex-1 min-h-0">
            <div className="min-w-[600px] px-10 py-10">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-foreground">
                  {t(`settings.${activeTab}.label`)}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {t(`settings.${activeTab}.description`)}
                </p>
              </div>
              <hr className="border-t border-line mb-6" />
              {settings.saveMessage && (
                <div className="mb-6 flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-green-700 dark:text-green-400 text-sm">
                  <CheckCircle className="size-4" />
                  {settings.saveMessage}
                </div>
              )}
              {activeTab === "general" && (
                <GeneralTab
                  language={settings.language}
                  setLanguage={settings.setLanguage}
                  emailNotifications={settings.emailNotifications}
                  setEmailNotifications={settings.setEmailNotifications}
                  isSaving={settings.isSaving}
                  isDirty={settings.isGeneralDirty}
                  onSave={settings.handleSaveGeneral}
                />
              )}
              {activeTab === "profile" && (
                <ProfileTab
                  user={settings.user}
                  isOAuth={!!settings.isOAuth}
                  email={settings.email}
                  setEmail={settings.setEmail}
                  isSaving={settings.isSaving}
                  onSave={settings.handleSaveProfile}
                />
              )}
              {activeTab === "archiving" && (
                <ArchivingTab />
              )}
              {activeTab === "security" && (
                <SecurityTab isOAuth={!!settings.isOAuth} />
              )}
            </div>
          </ScrollIndicator>
        </div>
      </DialogContent>
    </Dialog>
  );
}