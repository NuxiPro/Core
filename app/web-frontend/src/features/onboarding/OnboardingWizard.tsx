/**
 * Onboarding Wizard
 *
 * Container multi-étapes pour l'onboarding.
 * Gère la navigation, les animations de slide, et la création du workspace.
 */

import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  createWorkspace,
  type Workspace,
} from "@/src/features/board/api/workspaces";
import { WelcomeStep } from "@/src/features/onboarding/steps/WelcomeStep";
import { WorkspaceStep } from "@/src/features/onboarding/steps/WorkspaceStep";

type WizardStep = "welcome" | "workspace" | "loading" | "success";

export function OnboardingWizard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const animFrameRef = useRef<number>(0);

  const [step, setStep] = useState<WizardStep>("welcome");
  const [direction, setDirection] = useState<"forward" | "back">("forward");
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

  const goNext = () => {
    setDirection("forward");
    setStep("workspace");
  };

  const handleSubmit = async (name: string) => {
    setWorkspaceName(name);
    setStep("loading");

    try {
      // Créer le workspace
      const workspace = await createWorkspace({ name });

      queryClient.setQueryData<Workspace[]>(["workspaces"], (old) => [
        ...(old ?? []),
        workspace,
      ]);

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
      setStep("workspace");
    }
  };

  // Progress dots
  const totalSteps = 2;
  const currentStep = step === "welcome" ? 1 : step === "workspace" ? 2 : 2;

  // Slide animation classes
  const slideClass =
    direction === "forward"
      ? "animate-[slideInLeft_0.35s_ease-out_forwards]"
      : "animate-[slideInRight_0.35s_ease-out_forwards]";

  return (
    <div className="h-full w-full bg-surface-root flex items-center justify-center">
      {/* Steps */}
      {step === "welcome" && (
        <div key="welcome" className={`w-full ${slideClass}`}>
          <WelcomeStep onNext={goNext} />
        </div>
      )}
      {step === "workspace" && (
        <div key="workspace" className={`w-full ${slideClass}`}>
          <WorkspaceStep onSubmit={handleSubmit} isSubmitting={false} />
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
                Création de votre espace{" "}
                <span className="text-text-label">{workspaceName}</span>...
              </h1>

              <h1
                className={`text-2xl font-semibold tracking-tight text-text-primary absolute inset-0 transition-all duration-300 ${
                  step === "success"
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 -translate-y-1"
                }`}
              >
                Bienvenue à bord.
              </h1>
            </div>
          </div>
        </div>
      )}

      {/* Progress dots */}
      {(step === "welcome" || step === "workspace") && (
        <div className="fixed bottom-8 left-0 right-0 flex justify-center gap-2">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: static progress dots, order never changes
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i + 1 <= currentStep
                  ? "w-6 bg-text-primary"
                  : "w-1.5 bg-border-subtle"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
