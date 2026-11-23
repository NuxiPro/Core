/**
 * Archive Mode Step
 *
 * Second screen — the user picks how tasks reach the archive: right away
 * when dropped in "Done", or time-based after a delay (7 days, 14 days
 * or custom). Both modes are automations; only the timing differs.
 * Same visual language as WorkspaceStep (Apple clarity × keyboard-first
 * Linear precision).
 */

import { Archive, Clock, Zap } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { ArchiveMode } from "@/src/features/settings/api/settings";
import { Button } from "@/src/layout/components/ui/button";
import { Input } from "@/src/layout/components/ui/input";

// What the step submits: the mode, and the delay only in "time" mode.
export interface ArchiveModeResult {
  mode: ArchiveMode;
  delayDays: number | null;
}

interface ArchiveModeStepProps {
  onSubmit: (result: ArchiveModeResult) => void;
}

export function ArchiveModeStep({ onSubmit }: ArchiveModeStepProps) {
  const { t } = useTranslation();
  // Default: instant archiving is the simple behavior.
  const [mode, setMode] = useState<ArchiveMode>("instant");
  const [delayChoice, setDelayChoice] = useState<"7" | "14" | "custom">("7");
  const [customDays, setCustomDays] = useState("");

  const options = [
    {
      value: "instant",
      icon: Zap,
      title: t("onboarding.archiveModeInstantTitle"),
      description: t("onboarding.archiveModeInstantDesc"),
      badge: t("onboarding.archiveModeInstantBadge"),
    },
    {
      value: "time",
      icon: Clock,
      title: t("onboarding.archiveModeTimeTitle"),
      description: t("onboarding.archiveModeTimeDesc"),
      badge: null,
    },
  ] as const;

  const delayOptions = [
    { value: "7", label: t("onboarding.archiveDelay7") },
    { value: "14", label: t("onboarding.archiveDelay14") },
    { value: "custom", label: t("onboarding.archiveDelayCustom") },
  ] as const;

  const parsedCustomDays = Number(customDays);
  // In "time" mode the delay must be a valid choice (or a custom 1–90).
  const isDelayValid =
    mode !== "time" ||
    (delayChoice !== "custom"
      ? true
      : Number.isInteger(parsedCustomDays) &&
        parsedCustomDays >= 1 &&
        parsedCustomDays <= 90);

  const delayDays: number | null =
    mode !== "time"
      ? null
      : delayChoice === "custom"
        ? parsedCustomDays
        : Number(delayChoice);

  return (
    <section className="min-h-full flex flex-col items-center justify-center px-6 motion-safe:animate-[fadeIn_0.35s_ease-out_forwards]">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (isDelayValid) onSubmit({ mode, delayDays });
        }}
        className="max-w-[400px] w-full space-y-8"
      >
        {/* Header — même structure que WorkspaceStep. */}
        <div className="space-y-4 text-center motion-safe:animate-[fadeInUp_0.45s_ease-out_0.05s_both]">
          <div className="mx-auto w-12 h-12 rounded-xl bg-surface-card border border-border-subtle shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] flex items-center justify-center">
            <Archive className="w-5 h-5 text-text-primary" aria-hidden="true" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-[-0.02em] text-text-primary text-balance">
              {t("onboarding.archiveModeTitle")}
            </h1>
            <p className="text-sm text-text-label leading-relaxed text-pretty">
              {t("onboarding.archiveModeDescription")}
            </p>
          </div>
        </div>

        {/* Two radio cards — native radios give keyboard navigation
            (arrow keys) for free. */}
        <fieldset className="space-y-3 motion-safe:animate-[fadeInUp_0.45s_ease-out_0.15s_both]">
          <legend className="sr-only">
            {t("onboarding.archiveModeLegend")}
          </legend>
          {options.map((option) => {
            const checked = mode === option.value;
            return (
              <label
                key={option.value}
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 text-left transition-all duration-150 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-text-primary/40 ${
                  checked
                    ? "border-text-primary/50 bg-surface-card shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]"
                    : "border-border-subtle bg-surface-card/50 hover:border-text-muted-hard"
                }`}
              >
                <input
                  type="radio"
                  name="archive-mode"
                  value={option.value}
                  checked={checked}
                  onChange={() => setMode(option.value)}
                  className="sr-only"
                />
                {/* Visual radio dot (the real input is sr-only). */}
                <span
                  aria-hidden="true"
                  className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors ${
                    checked ? "border-text-primary" : "border-text-muted-hard"
                  }`}
                >
                  {checked && (
                    <span className="h-2 w-2 rounded-full bg-text-primary" />
                  )}
                </span>

                <span className="min-w-0 space-y-0.5">
                  <span className="flex flex-wrap items-center gap-1.5 text-sm font-medium text-text-primary">
                    <option.icon
                      className="h-3.5 w-3.5 shrink-0"
                      aria-hidden="true"
                    />
                    {option.title}
                    {/* Nudge: cuts decision time for hesitant users. */}
                    {option.badge && (
                      <span className="rounded-full bg-text-primary/10 px-2 py-0.5 text-[10px] font-medium text-text-primary">
                        {option.badge}
                      </span>
                    )}
                  </span>
                  <span className="block text-xs leading-relaxed text-text-label">
                    {option.description}
                  </span>
                </span>
              </label>
            );
          })}
        </fieldset>

        {/* Delay sub-question of the time-based mode: 3 pills, nothing else. */}
        {mode === "time" && (
          <fieldset className="space-y-3 motion-safe:animate-[fadeInUp_0.35s_ease-out_0.1s_both]">
            <legend className="sr-only">
              {t("onboarding.archiveDelayQuestion")}
            </legend>
            <p className="text-sm text-text-label text-pretty">
              {t("onboarding.archiveDelayQuestion")}
            </p>

            <div className="flex flex-wrap items-center gap-2">
              {delayOptions.map((option) => {
                const checked = delayChoice === option.value;
                return (
                  <label
                    key={option.value}
                    className={`cursor-pointer rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-text-primary/40 ${
                      checked
                        ? "border-text-primary/50 bg-surface-card text-text-primary"
                        : "border-border-subtle bg-surface-card/50 text-text-label hover:border-text-muted-hard"
                    }`}
                  >
                    <input
                      type="radio"
                      name="archive-delay"
                      value={option.value}
                      checked={checked}
                      onChange={() => setDelayChoice(option.value)}
                      className="sr-only"
                    />
                    {option.label}
                  </label>
                );
              })}
            </div>

            {/* Custom choice: number of days (1–90). */}
            {delayChoice === "custom" && (
              <div className="flex items-center gap-2 motion-safe:animate-[fadeInUp_0.3s_ease-out_0.05s_both]">
                <Input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={90}
                  value={customDays}
                  onChange={(e) => setCustomDays(e.target.value)}
                  autoFocus
                  aria-label={t("onboarding.archiveDelayQuestion")}
                  className="h-9 w-24 rounded-lg border-border-subtle bg-surface-card/80 text-center text-sm text-text-primary [appearance:textfield] focus-visible:border-text-primary/40"
                />
                <span className="text-xs text-text-label">
                  {t("onboarding.archiveDelayUnit")}
                </span>
              </div>
            )}
          </fieldset>
        )}

        {/* CTA — même style que WorkspaceStep. */}
        <div className="motion-safe:animate-[fadeInUp_0.45s_ease-out_0.25s_both]">
          <Button
            type="submit"
            disabled={!isDelayValid}
            className="w-full h-11 bg-text-primary text-surface-root hover:opacity-92 active:scale-[0.99] rounded-lg font-medium text-sm shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)] transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-35 disabled:pointer-events-none"
          >
            {t("onboarding.continue")}
          </Button>
        </div>
      </form>
    </section>
  );
}
