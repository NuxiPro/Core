import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { CheckIcon } from "@/src/layout/components/ui/auth-icons";

export function MagicLinkSent({ email }: { email?: string }) {
  const { t } = useTranslation();
  // Staged entrance: mount then reveal with Apple Pay-like staggered ease.
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const step = () =>
    `transition-all duration-500 ease-out ${
      shown
        ? "opacity-100 translate-y-0 scale-100"
        : "opacity-0 translate-y-2 scale-75"
    }`;

  return (
    <div className="space-y-3 text-center py-4">
      <div
        className={`mx-auto size-12 rounded-full bg-primary/15 flex items-center justify-center shadow-[0_0_24px_rgba(15,118,110,0.45)] ${step()}`}
        style={{ transitionDelay: "0ms" }}
      >
        <CheckIcon
          className="text-[#2dd4bf]"
          title={t("auth.magicLinkSent")}
          titleId="magic-link-title"
        />
      </div>
      <p
        className={`text-sm text-[#f7f8f8] font-medium ${step()}`}
        style={{ transitionDelay: "120ms" }}
      >
        {t("auth.magicLinkSent")}
      </p>
      <p
        className={`text-xs text-[#8a8f98] ${step()}`}
        style={{ transitionDelay: "240ms" }}
      >
        {t("auth.checkInbox")}
      </p>
      {email && (
        <p
          className={`text-sm font-medium text-[#f7f8f8] bg-[#0f1011] border border-[#23252a] rounded-lg px-3 py-2 inline-block ${step()}`}
          style={{ transitionDelay: "360ms" }}
        >
          {email}
        </p>
      )}
    </div>
  );
}
