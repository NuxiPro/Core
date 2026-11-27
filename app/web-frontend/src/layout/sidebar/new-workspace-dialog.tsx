import { useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  createWorkspace,
  type Workspace,
} from "@/src/features/board/api/workspaces";
import { Button } from "@/src/layout/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/src/layout/components/ui/dialog";
import { Input } from "@/src/layout/components/ui/input";

export function NewWorkspaceDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasError, setHasError] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setName("");
      setHasError(false);
      setIsSubmitting(false);
    }
    onOpenChange(nextOpen);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName || isSubmitting) return;

    setIsSubmitting(true);
    setHasError(false);
    try {
      const workspace = await createWorkspace({ name: trimmedName });
      queryClient.setQueryData<Workspace[]>(["workspaces"], (workspaces) => {
        const current = workspaces ?? [];
        return current.some((item) => item.id === workspace.id)
          ? current
          : [...current, workspace];
      });
      handleOpenChange(false);
    } catch {
      setHasError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="w-[min(92vw,440px)] max-w-[440px] rounded-2xl border border-border-subtle bg-surface-card p-6 shadow-2xl sm:p-7"
        overlayClassName="bg-black/55 backdrop-blur-sm"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          nameInputRef.current?.focus();
        }}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2 pr-8">
            <DialogTitle className="text-lg font-semibold tracking-tight text-text-primary">
              {t("sidebar.newWorkspace")}
            </DialogTitle>
          </div>
          <div className="space-y-2">
            <label
              htmlFor="new-workspace-name"
              className="text-sm font-medium text-text-primary"
            >
              {t("onboarding.workspaceTitle")}
            </label>
            <Input
              ref={nameInputRef}
              id="new-workspace-name"
              autoComplete="off"
              maxLength={30}
              placeholder={t("sidebar.workspaceNamePlaceholder")}
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={isSubmitting}
              className="h-11 rounded-lg border border-border-subtle bg-surface-root px-3.5 text-sm text-text-primary placeholder:text-text-muted-hard focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/25"
            />
          </div>
          {hasError && (
            <p role="alert" className="-mt-3 text-sm text-destructive">
              {t("sidebar.workspaceCreateError")}
            </p>
          )}
          <div className="flex justify-end gap-2 border-t border-border-subtle pt-4">
            <Button
              type="button"
              variant="ghost"
              className="cursor-pointer"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              {t("task.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || isSubmitting}
              className="min-w-24 rounded-lg cursor-pointer"
            >
              {isSubmitting ? t("sidebar.creating") : t("sidebar.create")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
