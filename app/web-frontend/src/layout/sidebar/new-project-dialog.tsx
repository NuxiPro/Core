import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { XIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { createProject, type Project } from "@/src/features/board/api/projects";
import { useWorkspaces } from "@/src/features/board/hooks/useWorkspaces";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/src/layout/components/ui/dialog";
// slug stocké en DB utilisé directement (plus de projectSlug recalculé)

type NewProjectDialogProps = {
  onCreated?: (projectId: string) => void;
  isOpenByDefault?: boolean;
  forceOpen?: boolean;
  trigger?: React.ReactNode;
};

export function NewProjectDialog({
  onCreated,
  isOpenByDefault = false,
  forceOpen = false,
  trigger,
}: NewProjectDialogProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const navigate = useNavigate({ from: "/" });
  const { workspaces } = useWorkspaces();
  const [open, setOpen] = useState(isOpenByDefault || forceOpen);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [showDescription, setShowDescription] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const animFrameRef = useRef<number>(0);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const descInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpenByDefault || forceOpen) setOpen(true);
  }, [isOpenByDefault, forceOpen]);

  useEffect(() => {
    if (!isSubmitting) return;
    const start = Date.now();
    const duration = 400;
    const target = 85;
    const animate = () => {
      const elapsed = Date.now() - start;
      const raw = Math.min(elapsed / duration, 1);
      const eased = 1 - (1 - raw) ** 3;
      setProgress(eased * target);
      if (raw < 1) animFrameRef.current = requestAnimationFrame(animate);
    };
    animFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isSubmitting]);

  const resetForm = () => {
    setName("");
    setDescription("");
    setShowDescription(false);
    setProgress(0);
    setIsSubmitting(false);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) resetForm();
    setOpen(nextOpen);
  };

  const toggleDescription = () => {
    if (showDescription) {
      setDescription("");
      setShowDescription(false);
    } else {
      setShowDescription(true);
      setTimeout(() => descInputRef.current?.focus(), 50);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const currentWorkspace = workspaces[0];
      if (!currentWorkspace) {
        throw new Error(t("errors.noWorkspaceAvailable"));
      }

      const project = await createProject({
        name: name.trim(),
        description: description.trim(),
        workspaceId: currentWorkspace.id,
      });

      cancelAnimationFrame(animFrameRef.current);
      setProgress(100);
      await new Promise((r) => setTimeout(r, 200));

      queryClient.setQueryData<Project[]>(["projects"], (old) => [
        ...(old ?? []),
        project,
      ]);

      if (onCreated) {
        onCreated(project.id);
      } else {
        navigate({
          to: "/kanban/$projectSlug",
          params: { projectSlug: project.slug },
        });
      }

      resetForm();
      setOpen(false);
    } catch {
      cancelAnimationFrame(animFrameRef.current);
      setProgress(0);
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 h-9 px-4 text-[13px] font-medium rounded-lg border border-border-subtle bg-surface-card text-text-primary hover:bg-surface-hover transition-colors"
          >
            + {t("sidebar.newProject")}
          </button>
        </DialogTrigger>
      )}
      <DialogContent
        className="w-full max-w-[420px] bg-surface-card border border-border-subtle rounded-lg shadow-2xl overflow-hidden p-0 focus:outline-none"
        overlayClassName="bg-black/40 backdrop-blur-sm"
        showCloseButton={false}
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          nameInputRef.current?.focus();
        }}
      >
        {/* Progress bar */}
        <div className="h-1 w-full bg-border-subtle">
          <div
            className="h-full bg-text-primary transition-none"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Close button */}
        <DialogClose asChild>
          <button
            type="button"
            className="absolute top-3 right-3 z-10 p-1 rounded-md text-text-muted-hard hover:text-text-primary hover:bg-surface-hover transition-colors"
          >
            <XIcon className="w-4 h-4" />
            <span className="sr-only">{t("common.close")}</span>
          </button>
        </DialogClose>

        {/* Content */}
        <form onSubmit={handleSubmit} className="px-6 pt-6 pb-5">
          <DialogTitle className="text-[15px] font-medium text-text-primary tracking-tight mb-5">
            {t("sidebar.newProject")}
          </DialogTitle>

          <div className="space-y-4">
            <div>
              <input
                ref={nameInputRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t("sidebar.projectNamePlaceholder")}
                maxLength={30}
                disabled={isSubmitting}
                className="w-full h-10 px-3 bg-surface-root border border-border-subtle rounded-lg text-[14px] text-text-primary placeholder:text-text-muted-hard focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-colors disabled:opacity-50"
              />
            </div>

            {!showDescription ? (
              <button
                type="button"
                onClick={toggleDescription}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[12px] font-medium text-text-label bg-surface-hover hover:bg-border-subtle rounded-md transition-colors disabled:opacity-50"
              >
                + {t("sidebar.addDescription")}
              </button>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-text-label">
                    {t("sidebar.description")}
                  </span>
                  <button
                    type="button"
                    onClick={toggleDescription}
                    disabled={isSubmitting}
                    className="text-[11px] text-text-muted-hard hover:text-text-label transition-colors disabled:opacity-50"
                  >
                    {t("common.remove")}
                  </button>
                </div>
                <textarea
                  ref={descInputRef}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t("sidebar.descriptionPlaceholder")}
                  maxLength={200}
                  rows={3}
                  disabled={isSubmitting}
                  className="w-full px-3 py-2.5 bg-surface-root border border-border-subtle rounded-lg text-[14px] text-text-primary placeholder:text-text-muted-hard focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-colors resize-none disabled:opacity-50"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end mt-6">
            <button
              type="submit"
              disabled={!name.trim() || isSubmitting}
              className="h-9 px-4 bg-text-primary text-surface-root hover:opacity-90 font-medium text-[13px] rounded-lg transition-colors disabled:opacity-40"
            >
              {isSubmitting ? t("sidebar.creating") : t("sidebar.create")}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
