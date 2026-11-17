/**
 * Onboarding Wizard
 *
 * Conteneur simplifié — deux étapes : nom du workspace, puis mode
 * d'archivage. La création (workspace + préférence) part d'un coup,
 * pendant l'animation de chargement.
 */

import { createLogger } from "@packages/shared/utils/logger";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  createWorkspace,
  type Workspace,
} from "@/src/features/board/api/workspaces";
import {
  type ArchiveModeResult,
  ArchiveModeStep,
} from "@/src/features/onboarding/steps/ArchiveModeStep";
import { WorkspaceStep } from "@/src/features/onboarding/steps/WorkspaceStep";
import { patchSettings } from "@/src/features/settings/api/settings";

const log = createLogger("onboarding");

type WizardStep = "workspace" | "archiveMode" | "loading" | "success";

export function OnboardingWizard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const animFrameRef = useRef<number>(0);

  const [step, setStep] = useState<WizardStep>("workspace");
  const [progress, setProgress] = useState(0);
  const [workspaceName, setWorkspaceName] = useState("");

  // Phase de chargement — animation de 0 à 85%
  useEffect(() => {
    if (step !== "loading") return;

    const startTime = Date.now();
    const duration = 600;
    const target = 85;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const raw = Math.min(elapsed / duration, 1);
      const eased = 1 - (1 - raw) ** 3;
      setProgress(eased * target);

      if (raw < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [step]);

  // Étape 1 — le nom est retenu, la création n'a pas encore lieu.
  const handleWorkspaceNext = (name: string) => {
    setWorkspaceName(name);
    setStep("archiveMode");
  };

  // Étape 2 — création du workspace, puis préférences d'archivage.
  const handleCreate = async ({ mode, delayDays }: ArchiveModeResult) => {
    setStep("loading");

    try {
      // Créer le workspace
      const workspace = await createWorkspace({ name: workspaceName });

      queryClient.setQueryData<Workspace[]>(["workspaces"], (old) => [
        ...(old ?? []),
        workspace,
      ]);

      // Préférence non bloquante : en cas d'échec, le défaut "instant"
      // s'applique et l'user pourra la refaire dans la fenêtre de
      // personnalisation (à venir).
      try {
        await patchSettings({ archiveMode: mode, archiveDelayDays: delayDays });
      } catch (err) {
        log.warn("[onboarding] Failed to save archive mode preference", err);
      }

      // Snap to 100%
      cancelAnimationFrame(animFrameRef.current);
      setProgress(100);

      setStep("success");

      // Redirect vers le kanban
      setTimeout(() => {
        navigate({ to: "/kanban" });
      }, 400);
    } catch {
      cancelAnimationFrame(animFrameRef.current);
      setProgress(0);
      // Retour à l'étape du choix : le workspace n'a pas été créé.
      setStep("archiveMode");
    }
  };

  return (
    <div className="h-full w-full bg-surface-root flex items-center justify-center">
      {/* Steps */}
      {step === "workspace" && (
        <div
          key="workspace"
          className="w-full animate-[fadeIn_0.35s_ease-out_forwards]"
        >
          <WorkspaceStep onSubmit={handleWorkspaceNext} isSubmitting={false} />
        </div>
      )}
      {step === "archiveMode" && (
        <div
          key="archiveMode"
          className="w-full animate-[fadeIn_0.35s_ease-out_forwards]"
        >
          <ArchiveModeStep onSubmit={handleCreate} />
        </div>
      )}
      {(step === "loading" || step === "success") && (
        <div
          key="loading"
          className="flex flex-col items-center justify-center h-full w-full px-6 animate-[fadeIn_0.35s_ease-out_forwards]"
        >
          <div className="max-w-md w-full mx-auto space-y-8 text-center">
            {/* Progress bar */}
            <div
              className={`mx-auto transition-opacity duration-200 ${
                step === "success" ? "opacity-0" : "opacity-100"
              }`}
            >
              <div className="mx-auto h-1 w-48 bg-border-subtle rounded-full overflow-hidden">
                <div
                  className="h-full bg-text-primary rounded-full transition-[width] duration-100"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Text */}
            <div className="relative h-12">
              <h1
                className={`text-2xl font-semibold tracking-tight text-text-primary absolute inset-0 transition-all duration-200 ${
                  step === "success"
                    ? "opacity-0 translate-y-1"
                    : "opacity-100 translate-y-0"
                }`}
              >
                {t("onboarding.creatingWorkspace", { name: workspaceName })}
              </h1>

              <h1
                className={`text-2xl font-semibold tracking-tight text-text-primary absolute inset-0 transition-all duration-300 ${
                  step === "success"
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 -translate-y-1"
                }`}
              >
                {t("onboarding.welcomeAboard", { name: workspaceName })}
              </h1>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
