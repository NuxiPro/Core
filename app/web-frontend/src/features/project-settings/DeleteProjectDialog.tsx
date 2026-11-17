import type { Project } from "@packages/shared/types/project/projects";
import { Check, Copy, TriangleAlert } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/src/layout/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/src/layout/components/ui/dialog";
import { Input } from "@/src/layout/components/ui/input";
import { deleteProject } from "./api/api";

interface DeleteProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project;
  /** Appelé après une suppression réussie (nettoyage du cache + navigation). */
  onDeleted: () => void;
}

/**
 * Double confirmation de suppression d'un projet :
 * 1. le bouton rouge « Zone dangereuse » ouvre ce dialogue ;
 * 2. l'utilisateur doit saisir le nom exact du projet pour activer le bouton.
 *
 * Le dialogue énonce explicitement l'irréversibilité, l'absence de copie de
 * restauration et la responsabilité de l'utilisateur — information préalable
 * claire + consentement éclairé + action tracée côté serveur (log d'audit).
 */
export function DeleteProjectDialog({
  open,
  onOpenChange,
  project,
  onDeleted,
}: DeleteProjectDialogProps) {
  const { t } = useTranslation();
  const [confirmName, setConfirmName] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isError, setIsError] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">(
    "idle",
  );
  const copyTimer = useRef<number | null>(null);

  // Réinitialise la confirmation à chaque ouverture.
  useEffect(() => {
    if (!open) return;
    setConfirmName("");
    setIsError(false);
    setIsDeleting(false);
    setCopyState("idle");
    if (copyTimer.current) window.clearTimeout(copyTimer.current);
  }, [open]);

  useEffect(
    () => () => {
      if (copyTimer.current) window.clearTimeout(copyTimer.current);
    },
    [],
  );

  // Nom du projet copiable en un clic, inline dans la consigne (pattern
  // GitHub Primer : bouton toujours visible, succès affiché seulement si
  // l'écriture a réussi, échec jamais silencieux, bouton non désactivé).
  const handleCopy = () => {
    if (copyTimer.current) window.clearTimeout(copyTimer.current);
    navigator.clipboard
      .writeText(project.name)
      .then(() => setCopyState("copied"))
      .catch(() => setCopyState("failed"));
    copyTimer.current = window.setTimeout(() => setCopyState("idle"), 2000);
  };

  const isNameConfirmed = confirmName.trim() === project.name;

  const handleConfirm = async () => {
    if (!isNameConfirmed || isDeleting) return;
    setIsDeleting(true);
    setIsError(false);
    try {
      await deleteProject(project.id);
      onDeleted();
    } catch {
      setIsError(true);
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-black/60 backdrop-blur-sm"
        className="dark:[color-scheme:dark] [--dialog-bg:var(--surface-root)] [--dialog-border:var(--border)] w-[calc(100%-2rem)] max-w-md p-5 bg-[var(--surface-root)] border border-[var(--border)] rounded-xl shadow-2xl"
      >
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <TriangleAlert className="size-4" aria-hidden="true" />
          </div>
          <div className="min-w-0 space-y-1">
            <DialogTitle className="text-sm font-semibold text-[var(--text-primary)]">
              {t("settings.dangerZone.dialogTitle")}
            </DialogTitle>
            <DialogDescription className="text-xs text-[var(--text-label)]">
              {t("settings.dangerZone.dialogWarning", { name: project.name })}
            </DialogDescription>
          </div>
        </div>

        <ul className="mt-4 list-disc space-y-1 pl-4 text-xs text-[var(--text-label)]">
          <li>{t("settings.dangerZone.scopeColumns")}</li>
          <li>{t("settings.dangerZone.scopeTasks")}</li>
          <li>{t("settings.dangerZone.scopeArchive")}</li>
          <li>{t("settings.dangerZone.scopeIrreversible")}</li>
        </ul>

        <div className="mt-4 rounded-lg border border-destructive/20 bg-destructive/5 p-3">
          <p className="text-[11px] font-medium text-[var(--text-primary)]">
            {t("settings.dangerZone.legalIntro")}
          </p>
          <ul className="mt-1.5 list-disc space-y-1 pl-4 text-[11px] leading-relaxed text-[var(--text-label)]">
            <li>{t("settings.dangerZone.legalPoint1")}</li>
            <li>{t("settings.dangerZone.legalPoint2")}</li>
            <li>{t("settings.dangerZone.legalPoint3")}</li>
          </ul>
          <p className="mt-2 text-[11px] font-medium text-[var(--text-primary)]">
            {t("settings.dangerZone.legalLiability", {
              appName: t("brand.name"),
            })}
          </p>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            handleConfirm();
          }}
          className="mt-4 space-y-2"
        >
          <p className="text-xs font-medium text-[var(--text-primary)]">
            <label htmlFor="delete-project-confirm">
              {t("settings.dangerZone.confirmHint")}
            </label>{" "}
            <button
              type="button"
              onClick={handleCopy}
              title={t("settings.dangerZone.copyName")}
              aria-label={`${t("settings.dangerZone.copyName")} (${project.name})`}
              className="inline-flex max-w-full items-baseline gap-1 rounded font-mono text-xs text-primary underline decoration-dotted underline-offset-2 outline-none transition-colors select-all hover:text-primary-hover focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="truncate">{project.name}</span>
              {copyState === "copied" ? (
                <Check
                  className="size-3 shrink-0 text-emerald-600 dark:text-emerald-400"
                  aria-hidden="true"
                />
              ) : (
                <Copy className="size-3 shrink-0" aria-hidden="true" />
              )}
            </button>
            {/* Annonce copies pour les lecteurs d'écran (l'échange d'icône est invisible au lecteur). */}
            <span role="status" className="sr-only">
              {copyState === "copied" ? t("settings.dangerZone.copied") : ""}
            </span>
          </p>
          {copyState === "failed" && (
            <p role="alert" className="text-[11px] text-destructive">
              {t("settings.dangerZone.copyFailed")}
            </p>
          )}
          <Input
            id="delete-project-confirm"
            value={confirmName}
            onChange={(event) => {
              setConfirmName(event.target.value);
              setIsError(false);
            }}
            maxLength={30}
            placeholder={t("settings.dangerZone.confirmPlaceholder")}
            autoComplete="off"
            spellCheck={false}
            disabled={isDeleting}
            className="w-full rounded-lg border border-[var(--dialog-input-border)] bg-[var(--dialog-input-bg)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition-colors hover:border-[var(--border-subtle)] focus:border-destructive/50 focus:ring-2 focus:ring-destructive/20"
          />
        </form>

        {isError && (
          <p role="alert" className="mt-3 text-xs text-destructive">
            {t("settings.dangerZone.deleteError")}
          </p>
        )}

        <div className="mt-5 flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            {t("settings.dangerZone.cancel")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleConfirm}
            disabled={!isNameConfirmed || isDeleting}
          >
            {isDeleting
              ? t("settings.dangerZone.deleting")
              : t("settings.dangerZone.confirmButton")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
