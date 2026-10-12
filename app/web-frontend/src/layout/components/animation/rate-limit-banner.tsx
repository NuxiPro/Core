import { useCallback, useEffect, useState } from "react";
import { cn } from "@/src/shared/utils/utils";

interface RateLimitEvent extends CustomEvent {
  detail: { retryAfter: string };
}

export function RateLimitBanner() {
  const [visible, setVisible] = useState(false);
  const [retrySeconds, setRetrySeconds] = useState(120);

  const handleRateLimit = useCallback((e: Event) => {
    const { retryAfter } = (e as RateLimitEvent).detail;
    setRetrySeconds(Number(retryAfter) || 120);
    setVisible(true);

    const timer = setTimeout(() => {
      setVisible(false);
    }, 10_000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    window.addEventListener("rate-limit", handleRateLimit);
    return () => window.removeEventListener("rate-limit", handleRateLimit);
  }, [handleRateLimit]);

  const minutes = Math.ceil(retrySeconds / 60);

  return (
    <div
      className={cn(
        "overflow-hidden transition-all duration-500 ease-out",
        visible
          ? "max-h-20 opacity-100"
          : "max-h-0 opacity-0 -translate-x-full",
      )}
    >
      <div
        className={cn(
          "rounded-lg border px-4 py-3 text-sm",
          "bg-amber-500/[0.06] border-amber-500/20 text-amber-400",
          "transition-transform duration-500 ease-out",
          visible ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <strong className="font-semibold">Trop de tentatives.</strong> Veuillez
        patienter {minutes} minute{minutes > 1 ? "s" : ""} avant de réessayer.
      </div>
    </div>
  );
}
