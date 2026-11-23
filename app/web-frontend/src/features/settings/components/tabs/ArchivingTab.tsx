import { useTranslation } from "react-i18next";
import type { ArchiveMode } from "../../api/settings";

/**
 * "Archiving" tab — direct-update settings (no Save button).
 * The values come from the single ["settings"] query loaded once when the
 * dialog opens (useSettings); every change PATCHes and re-syncs that same
 * cache — the tab never fetches on its own.
 * Both archive modes are automations: "time" archives after the delay
 * below, "instant" archives the moment a task is dropped in Done.
 */
interface ArchivingTabProps {
  archiveMode: ArchiveMode;
  archiveDelayDays: number | null;
  setArchiveMode: (mode: ArchiveMode) => void;
  setArchiveDelayDays: (days: number) => void;
}

export function ArchivingTab({
  archiveMode,
  archiveDelayDays,
  setArchiveMode,
  setArchiveDelayDays,
}: ArchivingTabProps) {
  const { t } = useTranslation();
  // "time" = the task is archived on its own after the delay;
  // "instant" = archived the moment it is dropped in Done.
  const timeBasedArchiveEnabled = archiveMode === "time";
  // The stored delay starts empty (null) — show the default (30 days)
  // until the user picks one.
  const delay = archiveDelayDays ?? 30;

  return (
    <div className="space-y-4">
      <section
        className="bg-[var(--surface-card)] border border-[var(--border)] rounded-xl p-4 space-y-4"
        aria-label={t("settings.archiving.label")}
      >
        {/* Toggle between the two automatic modes: time-based / instant */}
        <div className="flex items-center justify-between py-3 border-b border-[var(--border)]/40 first:pt-0 last:pb-0">
          <div className="space-y-0.5 pr-4">
            <h4 className="text-sm font-medium text-[var(--text-primary)]">
              {t("settings.archiving.timeBasedArchive")}
            </h4>
            <p className="text-xs text-[var(--text-label)]">
              {t("settings.archiving.timeBasedArchiveDesc")}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={timeBasedArchiveEnabled}
            aria-label={t("settings.archiving.timeBasedArchive")}
            onClick={() =>
              setArchiveMode(timeBasedArchiveEnabled ? "instant" : "time")
            }
            className={`shrink-0 w-9 h-5 rounded-full relative transition-colors duration-150 ${
              timeBasedArchiveEnabled ? "bg-emerald-500" : "bg-[var(--border)]"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 size-4 rounded-full bg-white transition-transform duration-150 ${
                timeBasedArchiveEnabled ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Delay before the archive (time-based mode only) */}
        <div className="flex items-center justify-between py-3 border-b border-[var(--border)]/40 first:pt-0 last:pb-0">
          <div className="space-y-0.5 pr-4">
            <h4
              className="text-sm font-medium text-[var(--text-primary)]"
              id="archive-delay-label"
            >
              {t("settings.archiving.delay")}
            </h4>
            <p className="text-xs text-[var(--text-label)]">
              {t("settings.archiving.delayDesc")}
            </p>
          </div>
          <select
            aria-labelledby="archive-delay-label"
            value={delay}
            disabled={!timeBasedArchiveEnabled}
            onChange={(e) => setArchiveDelayDays(Number(e.target.value))}
            className="shrink-0 w-48 bg-[var(--dialog-input-bg)] border border-[var(--dialog-input-border)] rounded-lg px-3 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 hover:border-[var(--border-subtle)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value={7}>{t("settings.archiving.delay7")}</option>
            <option value={30}>{t("settings.archiving.delay30")}</option>
            <option value={90}>{t("settings.archiving.delay90")}</option>
          </select>
        </div>

        {/* Retention note */}
        <div className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
          <p className="text-xs text-[var(--text-label)]">
            {t("settings.archiving.retentionNote")}
          </p>
        </div>
      </section>
    </div>
  );
}
