import { CheckCircle, Settings, X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/src/layout/components/ui/dialog";
import { Separator } from "@/src/layout/components/ui/separator";
import { useSettings } from "../hooks/useSettings";
import type { SettingsTab } from "../types";
import { ScrollIndicator } from "./ScrollIndicator";
import { SettingsNavigation } from "./SettingsNavigation";
import { GeneralTab } from "./tabs/GeneralTab";
import { ProfileTab } from "./tabs/ProfileTab";
import { SecurityTab } from "./tabs/SecurityTab";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const settings = useSettings(open);
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[90vw] sm:h-[88vh] w-full h-full max-w-none p-0 gap-0 overflow-hidden bg-background border border-border rounded-xl flex flex-col data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:duration-150 data-[state=open]:duration-200 ease-out"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">
          {t("settings.projectSettings")}
        </DialogTitle>
        <DialogDescription className="sr-only">
          {t("settings.globalProjectSettings")}
        </DialogDescription>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-7 rounded-md bg-primary/10 dark:bg-primary/15">
              <Settings className="size-4 text-primary" />
            </div>
            <h2 className="text-sm font-semibold text-foreground">
              {t("settings.title")}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-150"
            aria-label={t("task.close")}
          >
            <X width={15} height={15} strokeWidth={1.5} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 flex min-h-0">
          <SettingsNavigation
            activeTab={activeTab}
            onTabChange={setActiveTab}
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

              <Separator className="mb-6" />

              {settings.saveMessage && (
                <div className="mb-6 flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-green-700 dark:text-green-400 text-sm">
                  <CheckCircle className="size-4" />
                  {settings.saveMessage}
                </div>
              )}

              {activeTab === "general" && (
                <GeneralTab
                  projectName={settings.projectName}
                  setProjectName={settings.setProjectName}
                  projectDescription={settings.projectDescription}
                  setProjectDescription={settings.setProjectDescription}
                  language={settings.language}
                  setLanguage={settings.setLanguage}
                  timezone={settings.timezone}
                  setTimezone={settings.setTimezone}
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
                  name={settings.name}
                  setName={settings.setName}
                  email={settings.email}
                  setEmail={settings.setEmail}
                  isSaving={settings.isSaving}
                  onSave={settings.handleSaveProfile}
                />
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
