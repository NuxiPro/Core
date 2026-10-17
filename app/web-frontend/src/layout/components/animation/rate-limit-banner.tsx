import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/src/shared/utils/utils";
import {
  formatDuration,
  type RateLimitTone,
  rateLimitTone,
} from "./rate-limit-policy";

interface RateLimitEvent extends CustomEvent {
  detail: { retryAfter: string; strikes?: number };
}

export function RateLimitBanner() {
  const { t, i18n } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [retrySeconds, setRetrySeconds] = useState(120);
  const [tone, setTone] = useState<RateLimitTone>("polite");
  const timer = useRef<number | null>(null);

  const handleRateLimit = useCallback((e: Event) => {
    const { retryAfter, strikes } = (e as RateLimitEvent).detail;
    setRetrySeconds(Number(retryAfter) || 120);
    setTone(rateLimitTone(Number(strikes) || 1));
    setVisible(true);

    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setVisible(false), 10_000);
  }, []);

  useEffect(() => {
    window.addEventListener("rate-limit", handleRateLimit);
    return () => {
      window.removeEventListener("rate-limit", handleRateLimit);
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [handleRateLimit]);

  const duration = formatDuration(retrySeconds, i18n.language);

  return (
    <div
      role="alert"
      className={cn(
        "overflow-hidden transition-all duration-500 ease-out",
        visible
          ? "max-h-24 opacity-100"
          : "max-h-0 opacity-0 -translate-x-full",
      )}
    >
      <div
        className={cn(
          "rounded-lg border px-4 py-3 text-sm",
          "transition-transform duration-500 ease-out",
          visible ? "translate-x-0" : "-translate-x-full",
          tone === "firm"
            ? "bg-red-500/[0.08] border-red-500/25 text-red-400"
            : "bg-amber-500/[0.06] border-amber-500/20 text-amber-400",
        )}
      >
        <strong className="font-semibold">
          {tone === "firm"
            ? t("errors.rateLimitedFirm", { duration })
            : t("errors.rateLimitedPolite", { duration })}
        </strong>
      </div>
    </div>
  );
}
