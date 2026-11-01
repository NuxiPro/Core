import { useTranslation } from "react-i18next";

interface SecurityTabProps {
  isOAuth: boolean;
}

export function SecurityTab({ isOAuth }: SecurityTabProps) {
  const { t } = useTranslation();

  if (isOAuth) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-primary/20 dark:border-primary/30 bg-primary/5 dark:bg-primary/10 p-3 flex items-start gap-3">
          <div>
            <p className="text-sm font-medium text-foreground">
              {t("settings.security.oauthAccount")}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t("settings.security.oauthAccountDesc")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Email-only account
  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-semibold text-foreground">
          {t("settings.security.accountSecurity")}
        </h4>
      </div>
      <div className="mt-4">
        <p className="text-sm text-muted-foreground">
          {t("settings.security.emailAccountDesc")}
        </p>
      </div>
    </div>
  );
}