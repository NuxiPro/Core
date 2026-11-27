import { useTranslation } from "react-i18next";
import type { ArchiveMode } from "../../api/settings";

interface ArchivingTabProps {
  archiveMode: ArchiveMode;
  setArchiveMode: (mode: ArchiveMode) => void;
}

export function ArchivingTab({
  archiveMode,
  setArchiveMode,
}: ArchivingTabProps) {
  const { t } = useTranslation();
  const timeBasedArchiveEnabled = archiveMode === "time";

  return (
    <div className="space-y-4">
      <section
        className="space-y-4 rounded-xl border border-[var(--border)] bg-[var(--surface-card)] p-4"
        aria-label={t("settings.archiving.label")}
      >
        <div className="flex items-center justify-between gap-4 border-b border-[var(--border)]/40 py-3 first:pt-0 last:border-0 last:pb-0">
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-sm font-medium text-[var(--text-primary)]">
                {t("settings.archiving.timeBasedArchive")}
              </h4>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                {t("settings.archiving.timeModeStatus")}
              </span>
            </div>
            <p
              id="time-based-archive-description"
              className="text-xs leading-relaxed text-[var(--text-label)]"
            >
              {t(
                timeBasedArchiveEnabled
                  ? "settings.archiving.timeModeStoredDesc"
                  : "settings.archiving.timeModeUnavailableDesc",
              )}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={timeBasedArchiveEnabled}
            aria-describedby="time-based-archive-description"
            aria-label={t("settings.archiving.timeBasedArchive")}
            disabled={!timeBasedArchiveEnabled}
            onClick={() => setArchiveMode("instant")}
            className={`relative h-5 w-9 shrink-0 rounded-full border border-transparent transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-card)] disabled:cursor-not-allowed ${
              timeBasedArchiveEnabled
                ? "bg-primary"
                : "bg-[var(--border)] dark:bg-surface-hover dark:border-border-subtle"
            }`}
          >
            <span
              className={`absolute left-0.5 top-0.5 size-4 rounded-full transition-[transform,background-color] duration-150 ${
                timeBasedArchiveEnabled
                  ? "translate-x-4 bg-white dark:bg-primary-foreground"
                  : "translate-x-0 bg-white dark:bg-foreground"
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between py-2">
          <p className="text-xs leading-relaxed text-[var(--text-label)]">
            {t("settings.archiving.retentionNote")}
          </p>
        </div>
      </section>
    </div>
  );
}
