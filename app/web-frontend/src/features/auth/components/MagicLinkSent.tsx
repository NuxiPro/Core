import { useTranslation } from "react-i18next";
import { CheckIcon } from "@/src/layout/components/ui/auth-icons";

export function MagicLinkSent({ email }: { email?: string }) {
  const { t } = useTranslation();
  return (
    <div className="space-y-3 text-center py-4">
      <div className="mx-auto size-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
        <CheckIcon
          className="text-emerald-400"
          title={t("auth.magicLinkSent")}
          titleId="magic-link-title"
        />
      </div>
      <p className="text-sm text-[#f7f8f8] font-medium">
        {t("auth.magicLinkSent")}
      </p>
      <p className="text-xs text-[#8a8f98]">{t("auth.checkInbox")}</p>
      {email && (
        <p className="text-sm font-medium text-[#f7f8f8] bg-[#0f1011] border border-[#23252a] rounded-lg px-3 py-2 inline-block">
          {email}
        </p>
      )}
    </div>
  );
}
