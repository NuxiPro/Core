/**
 * Collect the required workspace name and show the default archive behavior.
 */

import { Archive, Briefcase, Check, CornerDownLeft } from "lucide-react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/src/layout/components/ui/button";
import { Input } from "@/src/layout/components/ui/input";

interface WorkspaceStepProps {
  initialName?: string;
  onSubmit: (name: string) => void;
  isSubmitting: boolean;
}

export function WorkspaceStep({
  initialName = "",
  onSubmit,
  isSubmitting,
}: WorkspaceStepProps) {
  const { t } = useTranslation();
  const [name, setName] = useState(initialName);
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const trimmedName = name.trim();
  const isValid = trimmedName.length > 0;

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!isValid || isSubmitting) {
      setShake(true);
      inputRef.current?.focus();
      setTimeout(() => setShake(false), 300);
      return;
    }
    onSubmit(trimmedName);
  };

  return (
    <section className="min-h-full flex flex-col items-center justify-center px-6 motion-safe:animate-[fadeIn_0.35s_ease-out_forwards]">
      <form onSubmit={handleSubmit} className="max-w-[400px] w-full space-y-6">
        {/* Header */}
        <div className="space-y-4 text-center motion-safe:animate-[fadeInUp_0.45s_ease-out_0.05s_both]">
          <div className="mx-auto w-12 h-12 rounded-xl bg-surface-card border border-border-subtle shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] flex items-center justify-center">
            <Briefcase
              className="w-5 h-5 text-text-primary"
              aria-hidden="true"
            />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-[-0.02em] text-text-primary text-balance">
              {t("onboarding.workspaceTitle")}
            </h1>
            <p className="text-sm text-text-label leading-relaxed text-pretty">
              {t("onboarding.workspaceDescription")}
            </p>
          </div>
        </div>

        {/* Workspace name */}
        <div
          className={`space-y-3 motion-safe:animate-[fadeInUp_0.45s_ease-out_0.15s_both] ${
            shake ? "animate-[shake_0.28s_ease-in-out]" : ""
          }`}
        >
          <div className="relative group">
            <Input
              ref={inputRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("onboarding.workspacePlaceholder")}
              maxLength={30}
              autoFocus
              autoComplete="off"
              spellCheck={false}
              aria-label={t("onboarding.workspaceTitle")}
              className="h-11 px-3.5 pr-12 bg-surface-card/80 border-input text-text-primary placeholder:text-text-muted-hard rounded-lg text-[15px] text-left shadow-[inset_0_1px_2px_rgba(0,0,0,0.15)] focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary focus-visible:bg-surface-card transition-all duration-150"
            />
            {/* Show the counter only near its limit. */}
            {name.length > 20 && (
              <span
                aria-hidden="true"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-mono tabular-nums text-text-muted-hard select-none"
              >
                {name.length}/30
              </span>
            )}
          </div>

          {/* Instant archiving is the default and only available mode for now. */}
          <div className="flex items-start gap-3 rounded-lg border border-primary/30 bg-primary/5 p-3.5 text-left">
            <Archive
              className="mt-0.5 size-4 shrink-0 text-primary"
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm font-semibold text-text-primary">
                  {t("onboarding.instantArchiveTitle")}
                </h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                  <Check className="size-3" aria-hidden="true" />
                  {t("onboarding.instantArchiveSelected")}
                </span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-text-label">
                {t("onboarding.instantArchiveDescription")}
              </p>
            </div>
          </div>

          {/* Continue to workspace creation. */}
          <Button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="w-full h-11 bg-primary text-primary-foreground hover:opacity-92 active:scale-[0.99] rounded-lg font-medium text-sm shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)] transition-all duration-150 disabled:opacity-35 disabled:pointer-events-none flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 border-2 border-surface-root/30 border-t-surface-root rounded-full animate-spin" />
                {t("onboarding.workspaceCreate")}
              </span>
            ) : (
              <>
                <span>{t("onboarding.continue")}</span>
                <kbd className="hidden sm:inline-flex items-center justify-center px-1.5 py-0.5 text-[11px] font-mono rounded bg-surface-root/15 text-surface-root/80">
                  <CornerDownLeft className="w-3 h-3" />
                </kbd>
              </>
            )}
          </Button>
        </div>
      </form>
    </section>
  );
}
