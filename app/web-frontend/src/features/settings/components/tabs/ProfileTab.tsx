import { useTranslation } from "react-i18next";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/src/layout/components/ui/avatar";

interface ProfileTabProps {
  user: { name: string; email: string; avatar: string } | null;
  isOAuth: boolean;
  email: string;
  setEmail: (v: string) => void;
}

/**
 * Onglet « Compte & Sécurité » — identité + e-mail (validation manuelle via
 * le footer sticky de la modale) + statut de sécurité (lecture seule).
 */
export function ProfileTab({ user, isOAuth, email, setEmail }: ProfileTabProps) {
  const { t } = useTranslation();

  // Données serveur uniquement — aucun placeholder inventé.
  const displayName = user?.name?.trim() || user?.email || "";
  const nameInitials = displayName ? displayName.toUpperCase().charAt(0) : "?";

  return (
    <div className="space-y-4">
      {/* Carte Compte — identité */}
      <section
        className="bg-[var(--surface-card)] border border-[var(--border)] rounded-xl p-4 space-y-4"
        aria-label={t("settings.profile.label")}
      >
        <div className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
          <Avatar className="h-10 w-10 rounded-full shrink-0">
            <AvatarImage
              src={user?.avatar}
              alt={displayName}
              className="rounded-full"
            />
            <AvatarFallback className="rounded-full bg-[var(--surface-hover)] text-[var(--text-primary)] text-sm font-medium">
              {nameInitials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 space-y-0.5">
            <p className="text-sm font-medium text-[var(--text-primary)] truncate">
              {displayName}
            </p>
            <p className="text-xs text-[var(--text-label)] truncate">{user?.email}</p>
            <span className="inline-block text-[11px] text-[var(--text-muted-hard)] font-mono">
              {isOAuth ? "OAuth" : "Email"}
            </span>
          </div>
        </div>
      </section>

      {/* Carte Informations — e-mail */}
      <section
        className="bg-[var(--surface-card)] border border-[var(--border)] rounded-xl p-4 space-y-4"
        aria-label={t("settings.profile.personalInfo")}
      >
        <div className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
          <div className="space-y-0.5 pr-4">
            <label
              htmlFor="profile-email"
              className="text-sm font-medium text-[var(--text-primary)]"
            >
              {t("settings.profile.email")}
            </label>
            <p className="text-xs text-[var(--text-label)]">
              {t("settings.profile.emailDesc")}
            </p>
          </div>
          <input
            id="profile-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="shrink-0 w-64 bg-[var(--dialog-input-bg)] border border-[var(--dialog-input-border)] rounded-lg px-3 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 hover:border-[var(--border-subtle)] transition-colors"
          />
        </div>
      </section>

      {/* Carte Sécurité — statut du compte (lecture seule) */}
      <section
        className="bg-[var(--surface-card)] border border-[var(--border)] rounded-xl p-4 space-y-4"
        aria-label={t("settings.security.accountSecurity")}
      >
        <div className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
          <div className="space-y-0.5 pr-4">
            <h4 className="text-sm font-medium text-[var(--text-primary)]">
              {t("settings.security.accountSecurity")}
            </h4>
            {isOAuth ? (
              <p className="text-xs text-[var(--text-label)]">
                {t("settings.security.oauthAccount")} —{" "}
                {t("settings.security.oauthAccountDesc")}
              </p>
            ) : (
              <p className="text-xs text-[var(--text-label)]">
                {t("settings.security.emailAccountDesc")}
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
