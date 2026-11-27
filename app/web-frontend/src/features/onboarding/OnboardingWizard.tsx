/** Create a workspace with instant archiving as the default behavior. */

// biome-ignore-all lint/suspicious/noConsole: Report a non-blocking setup failure during development.
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  createWorkspace,
  type Workspace,
} from "@/src/features/board/api/workspaces";
import { WorkspaceStep } from "@/src/features/onboarding/steps/WorkspaceStep";
import { patchSettings } from "@/src/features/settings/api/settings";

type WizardStep = "workspace" | "loading";

export function OnboardingWizard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const animFrameRef = useRef<number>(0);

  const [step, setStep] = useState<WizardStep>("workspace");
  const [progress, setProgress] = useState(0);
  const [workspaceName, setWorkspaceName] = useState("");

  // Show progress while the workspace request is in flight.
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

  const handleCreate = async (name: string) => {
    setWorkspaceName(name);
    setStep("loading");

    try {
      const workspace = await createWorkspace({ name });

      queryClient.setQueryData<Workspace[]>(["workspaces"], (old) => [
        ...(old ?? []),
        workspace,
      ]);

      // The server default is instant; persist it without delaying navigation.
      void patchSettings({ archiveMode: "instant" }).catch(() => {
        if (import.meta.env.DEV) {
          console.warn("Failed to save archive mode preference");
        }
      });

      cancelAnimationFrame(animFrameRef.current);
      navigate({ to: "/kanban" });
    } catch {
      cancelAnimationFrame(animFrameRef.current);
      setProgress(0);
      // Keep the entered name if workspace creation fails.
      setStep("workspace");
    }
  };

  return (
    <div className="h-full w-full bg-surface-root flex items-center justify-center">
      {/* Workspace setup */}
      {step === "workspace" && (
        <div
          key="workspace"
          className="w-full animate-[fadeIn_0.35s_ease-out_forwards]"
        >
          <WorkspaceStep
            initialName={workspaceName}
            onSubmit={handleCreate}
            isSubmitting={false}
          />
        </div>
      )}
      {step === "loading" && (
        <div
          key="loading"
          className="flex flex-col items-center justify-center h-full w-full px-6 animate-[fadeIn_0.35s_ease-out_forwards]"
        >
          <div className="max-w-md w-full mx-auto space-y-8 text-center">
            {/* Progress bar */}
            <div className="mx-auto">
              <div className="mx-auto h-1 w-48 bg-border-subtle rounded-full overflow-hidden">
                <div
                  className="h-full bg-text-primary rounded-full transition-[width] duration-100"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Workspace name */}
            <div className="relative h-12">
              <h1 className="text-2xl font-semibold tracking-tight text-text-primary absolute inset-0">
                {t("onboarding.creatingWorkspace", { name: workspaceName })}
              </h1>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
