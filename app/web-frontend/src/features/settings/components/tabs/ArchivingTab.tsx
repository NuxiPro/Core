import { useState } from "react";

export function ArchivingTab() {
  const [autoArchiveEnabled, setAutoArchiveEnabled] = useState(true);
  const [archiveDelay, setArchiveDelay] = useState("Après 30 jours"); // matches default selected

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white">
          Archivage & Automatisation
        </h2>
        <p className="text-xs text-gray-400">
          Configurez la rétention automatique des tâches terminées
          (&quot;Done&quot;).
        </p>
      </div>

      <div className="space-y-4">
        {/* Auto-Archive Settings */}
        <div className="p-4 rounded-xl bg-dark-card border border-dark-border space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-200">
                Archivage automatique
              </p>
              <p className="text-xs text-gray-400">
                Déplace automatiquement les tâches &quot;Done&quot; vers les
                archives.
              </p>
            </div>
            {/* Toggle switch */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoArchiveEnabled}
                onChange={(e) => setAutoArchiveEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-dark-bg peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500" />
            </label>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-dark-border">
            <span className="text-xs text-gray-400">Délai avant archivage</span>
            <select
              value={archiveDelay}
              onChange={(e) => setArchiveDelay(e.target.value)}
              className="bg-dark-bg border border-dark-border text-xs rounded-lg px-3 py-1.5 text-gray-200 focus:outline-none focus:border-emerald-500"
            >
              <option>Après 7 jours</option>
              <option>Après 30 jours</option>
              <option>Après 90 jours</option>
            </select>
          </div>
        </div>

        {/* Retention Rule Banner */}
        <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-start space-x-3">
          <svg
            className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <title>Banner règle de rétention</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-xs text-gray-300">
            Conforme au mode de stockage actif. Vos tâches terminées sont
            conservées de manière sécurisée et restent recherchables dans la
            zone d'archivage globale.
          </p>
        </div>
      </div>
    </div>
  );
}
