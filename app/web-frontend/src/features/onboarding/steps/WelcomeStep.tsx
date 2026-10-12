/**
 * Welcome Step
 *
 * Premier écran de l'onboarding — message d'accueil premium.
 */

import { Rocket } from "lucide-react";
import { Button } from "@/src/layout/components/ui/button";

interface WelcomeStepProps {
  onNext: () => void;
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <div className="min-h-full flex flex-col items-center justify-center px-6 animate-[fadeIn_0.4s_ease-out_forwards]">
      <div className="max-w-md w-full space-y-10 text-center">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-surface-card border border-border-subtle flex items-center justify-center animate-[fadeInUp_0.5s_ease-out_0.1s_both]">
          <Rocket className="w-8 h-8 text-text-primary" />
        </div>

        <div className="space-y-3 animate-[fadeInUp_0.5s_ease-out_0.2s_both]">
          <h1 className="text-3xl font-semibold tracking-tight text-text-primary">
            Bienvenue sur NuxiPro
          </h1>
          <p className="text-base text-text-label leading-relaxed">
            L'alternative minimaliste qui vous aide au quotidien
          </p>
        </div>

        <div className="animate-[fadeInUp_0.5s_ease-out_0.4s_both]">
          <Button
            onClick={onNext}
            className="w-full h-12 bg-text-primary text-surface-root hover:opacity-90 rounded-lg font-medium text-base transition-colors"
          >
            Commencer
          </Button>
        </div>
      </div>
    </div>
  );
}
