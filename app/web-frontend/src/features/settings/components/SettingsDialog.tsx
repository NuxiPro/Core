import { CheckCircle, X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/src/layout/components/ui/dialog";
import { useSettings } from "../hooks/useSettings";
import { SettingsNavigation, type SettingsTab } from "./SettingsNavigation";
import { ArchivingTab } from "./tabs/ArchivingTab";
import { GeneralTab } from "./tabs/GeneralTab";
import { ProfileTab } from "./tabs/ProfileTab";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Settings dialog capped at 840px with a blurred overlay.
 * Surfaces and controls use global theme tokens; native selects and autofill
 * switch to the dark color scheme only when dark mode is active.
 * Manual profile changes are confirmed in the sticky footer.
 */
export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const settings = useSettings(open);
  const { t } = useTranslation();

  // Seul l'onglet Compte nécessite une validation manuelle (e-mail).
  const showFooter = activeTab === "profile" && settings.isProfileDirty;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-black/60 backdrop-blur-sm"
        className="dark:[color-scheme:dark] [--dialog-bg:var(--surface-root)] [--dialog-border:var(--border)] w-[calc(100%-2rem)] max-w-[840px] max-h-[85vh] p-0 bg-[var(--surface-root)] border border-[var(--border)] rounded-xl shadow-2xl flex overflow-hidden"
      >
        {/* Sidebar de navigation (220px) */}
        <SettingsNavigation activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Panneau droit : en-tête de vue + cartes + footer sticky */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          <div className="flex-1 p-6 space-y-6 overflow-y-auto max-h-[85vh] scrollbar-thin">
            {/* En-tête de vue */}
            <DialogTitle className="text-lg font-semibold text-[var(--text-primary)]">
              {t(`settings.${activeTab}.label`)}
            </DialogTitle>
            <DialogDescription className="text-xs text-[var(--text-label)]">
              {t(`settings.${activeTab}.description`)}
            </DialogDescription>

            {/* Feedback de sauvegarde (profil uniquement) */}
            {settings.saveMessage && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs">
                <CheckCircle className="size-4 shrink-0" />
                {settings.saveMessage}
              </div>
            )}

            {activeTab === "general" && (
              <GeneralTab
                language={settings.language}
                setLanguage={settings.setLanguage}
                emailNotifications={settings.emailNotifications}
                setEmailNotifications={settings.setEmailNotifications}
              />
            )}
            {activeTab === "profile" && (
              <ProfileTab
                user={settings.user}
                isOAuth={!!settings.isOAuth}
                email={settings.email}
                setEmail={settings.setEmail}
              />
            )}
            {activeTab === "archiving" && (
              <ArchivingTab
                archiveMode={settings.archiveMode}
                setArchiveMode={settings.setArchiveMode}
              />
            )}
          </div>

          {/* Footer sticky — uniquement pour la validation manuelle */}
          {showFooter && (
            <div className="shrink-0 flex items-center justify-end gap-2 px-5 py-3 border-t border-[var(--border)]">
              <button
                type="button"
                onClick={settings.handleSaveProfile}
                disabled={settings.isSaving}
                className="px-4 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none"
              >
                {settings.isSaving ? t("settings.saving") : t("settings.save")}
              </button>
            </div>
          )}
        </div>

        {/* Fermeture */}
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="absolute top-3 right-3 p-1.5 rounded-lg text-[var(--text-label)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors"
          aria-label={t("common.close")}
        >
          <X width={15} height={15} strokeWidth={1.5} />
        </button>
      </DialogContent>
    </Dialog>
  );
}
