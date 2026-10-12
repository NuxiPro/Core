import { AlertTriangle, CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/src/layout/components/ui/badge";
import { Separator } from "@/src/layout/components/ui/separator";

interface SecurityTabProps {
  isOAuth: boolean;
}

export function SecurityTab({ isOAuth }: SecurityTabProps) {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      {isOAuth && (
        <div className="rounded-lg border border-primary/20 dark:border-primary/30 bg-primary/5 dark:bg-primary/10 p-3 flex items-start gap-3">
          <AlertTriangle className="size-4 text-primary dark:text-primary-hover mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">
              {t("settings.security.oauthAccount")}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t("settings.security.oauthAccountDesc")}
            </p>
          </div>
        </div>
      )}

      {!isOAuth && (
        <>
          <div>
            <h4 className="text-sm font-semibold text-foreground">
              {t("settings.security.accountSecurity")}
            </h4>
          </div>
          <Separator />
        </>
      )}

      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-semibold text-foreground">
            {t("settings.security.activeSessions")}
          </h4>
        </div>

        <div className="flex items-center justify-between gap-4 p-2.5 rounded-lg bg-muted/50">
          <div className="flex items-center gap-3">
            <div className="size-7 rounded-md bg-green-100 dark:bg-green-500/10 flex items-center justify-center">
              <CheckCircle className="size-3.5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {t("settings.security.currentSession")}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {t("settings.security.currentSessionDesc")}
              </p>
            </div>
          </div>
          <Badge
            variant="secondary"
            className="text-[10px] bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/20"
          >
            {t("settings.security.active")}
          </Badge>
        </div>
      </div>
    </div>
  );
}
