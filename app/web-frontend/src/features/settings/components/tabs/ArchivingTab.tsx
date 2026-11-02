import { useState } from "react";
import { useTranslation } from "react-i18next";

/**
 * Onglet « Archivage & Auto » — réglages à mise à jour directe (aucun
 * bouton Save). Les valeurs proviennent de l'état réactif ; la persistance
 * serveur sera branchée sur la route PATCH (08 §3.2).
 */
export function ArchivingTab() {
  const { t } = useTranslation();
  const [autoArchiveEnabled, setAutoArchiveEnabled] = useState(true);
  const [archiveDelayDays, setArchiveDelayDays] = useState(30);

  return (
    <div className="space-y-4">
      <section
        className="bg-[var(--surface-card)] border border-[var(--border)] rounded-xl p-4 space-y-4"
        aria-label={t("settings.archiving.label")}
      >
        {/* Toggle auto-archive */}
        <div className="flex items-center justify-between py-3 border-b border-[var(--border)]/40 first:pt-0 last:pb-0">
          <div className="space-y-0.5 pr-4">
            <h4 className="text-sm font-medium text-[var(--text-primary)]">
              {t("settings.archiving.autoArchive")}
            </h4>
            <p className="text-xs text-[var(--text-label)]">
              {t("settings.archiving.autoArchiveDesc")}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={autoArchiveEnabled}
            aria-label={t("settings.archiving.autoArchive")}
            onClick={() => setAutoArchiveEnabled(!autoArchiveEnabled)}
            className={`shrink-0 w-9 h-5 rounded-full relative transition-colors duration-150 ${
              autoArchiveEnabled ? "bg-emerald-500" : "bg-[var(--border)]"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 size-4 rounded-full bg-white transition-transform duration-150 ${
                autoArchiveEnabled ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Délai */}
        <div className="flex items-center justify-between py-3 border-b border-[var(--border)]/40 first:pt-0 last:pb-0">
          <div className="space-y-0.5 pr-4">
            <h4 className="text-sm font-medium text-[var(--text-primary)]" id="archive-delay-label">
              {t("settings.archiving.delay")}
            </h4>
            <p className="text-xs text-[var(--text-label)]">
              {t("settings.archiving.delayDesc")}
            </p>
          </div>
          <select
            aria-labelledby="archive-delay-label"
            value={archiveDelayDays}
            disabled={!autoArchiveEnabled}
            onChange={(e) => setArchiveDelayDays(Number(e.target.value))}
            className="shrink-0 w-48 bg-[var(--dialog-input-bg)] border border-[var(--dialog-input-border)] rounded-lg px-3 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 hover:border-[var(--border-subtle)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value={7}>{t("settings.archiving.delay7")}</option>
            <option value={30}>{t("settings.archiving.delay30")}</option>
            <option value={90}>{t("settings.archiving.delay90")}</option>
          </select>
        </div>

        {/* Note de rétention */}
        <div className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
          <p className="text-xs text-[var(--text-label)]">
            {t("settings.archiving.retentionNote")}
          </p>
        </div>
      </section>
    </div>
  );
}
