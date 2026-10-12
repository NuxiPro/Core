/**
 * Workspace Step
 *
 * Premier écran — nom du workspace (obligatoire).
 * Style premium inspiré Trade Republic.
 */

import { Briefcase } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/src/layout/components/ui/button";
import { Input } from "@/src/layout/components/ui/input";

interface WorkspaceStepProps {
  onSubmit: (name: string) => void;
  isSubmitting: boolean;
}

export function WorkspaceStep({ onSubmit, isSubmitting }: WorkspaceStepProps) {
  const [name, setName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSubmit(name.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="min-h-full flex flex-col items-center justify-center px-6 animate-[fadeIn_0.4s_ease-out_forwards]">
      <div className="max-w-md w-full space-y-10 text-center">
        {/* Icon */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-surface-card border border-border-subtle flex items-center justify-center animate-[fadeInUp_0.5s_ease-out_0.1s_both]">
          <Briefcase className="w-8 h-8 text-text-primary" />
        </div>

        {/* Heading */}
        <div className="space-y-3 animate-[fadeInUp_0.5s_ease-out_0.2s_both]">
          <h1 className="text-3xl font-semibold tracking-tight text-text-primary">
            Créez votre espace
          </h1>
          <p className="text-base text-text-label leading-relaxed">
            Un workspace, un objectif. Vous pourrez en ajouter d'autres plus
            tard.
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4 animate-[fadeInUp_0.5s_ease-out_0.3s_both]">
          <Input
            ref={inputRef}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ex: Mon équipe, Marketing Q3..."
            maxLength={30}
            autoFocus
            className="h-12 bg-surface-card border-border-subtle text-text-primary placeholder:text-text-muted-hard rounded-lg text-lg text-center focus-visible:ring-0 focus-visible:border-border focus-visible:shadow-[0_0_0_1px_var(--border)] transition-all duration-200"
          />
        </div>

        {/* CTA */}
        <div className="animate-[fadeInUp_0.5s_ease-out_0.4s_both]">
          <Button
            onClick={handleSubmit}
            disabled={!name.trim() || isSubmitting}
            className="w-full h-12 bg-text-primary text-surface-root hover:opacity-90 rounded-lg font-medium text-base transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-surface-root/30 border-t-surface-root rounded-full animate-spin" />
                Création...
              </span>
            ) : (
              "Commencer"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
