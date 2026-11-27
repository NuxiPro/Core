import type { Project } from "@packages/shared/types/project/projects";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  CheckCircle,
  CircleAlert,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useProjects } from "@/src/features/board/hooks/useProjects";
import { Button } from "@/src/layout/components/ui/button";
import { Input } from "@/src/layout/components/ui/input";
import { Skeleton } from "@/src/layout/components/ui/skeleton";
import { cn } from "@/src/shared/utils/utils";
import { updateProject } from "./api/api";
import { DeleteProjectDialog } from "./DeleteProjectDialog";

const NAME_MAX = 30;
const DESCRIPTION_MAX = 200;

// Tokens sémantiques du global.css (adaptés au thème clair/sombre automatiquement).
const fieldClassName =
  "w-full rounded-lg border border-input bg-surface-root px-3 py-2 text-sm text-text-primary placeholder:text-text-muted-hard outline-none transition-colors hover:border-border-subtle focus:border-primary focus:ring-2 focus:ring-primary/30";

interface ProjectSettingsPageProps {
  projectSlug: string;
}

export function ProjectSettingsPage({ projectSlug }: ProjectSettingsPageProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { projects, isLoading, isError } = useProjects();
  const project = projects.find(({ slug }) => slug === projectSlug);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [hasEdits, setHasEdits] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<"saved" | "error" | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const navigate = useNavigate();

  // Synchronise les champs à l'entrée sur le projet, sans écraser une saisie en cours.
  // (Le composant est remonté via `key` à chaque changement de projet.)
  useEffect(() => {
    if (!project || hasEdits) return;
    setName(project.name);
    setDescription(project.description ?? "");
  }, [project, hasEdits]);

  if (isLoading) {
    return (
      <main className="h-full overflow-y-auto bg-surface-workspace scrollbar-thin">
        <div className="mx-auto w-full max-w-2xl space-y-6 px-6 py-8 md:px-10">
          <Skeleton className="h-3 w-40" />
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-72 w-full rounded-xl" />
        </div>
      </main>
    );
  }

  if (isError || !project) {
    return (
      <main className="flex h-full items-center justify-center bg-surface-workspace">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-sm text-text-label">
            {t("settings.project.notFound")}
          </p>
          <Button variant="outline" size="sm" asChild>
            <Link
              to="/kanban/$projectSlug"
              params={{ projectSlug }}
              className="inline-flex items-center gap-2"
            >
              <ArrowLeft className="size-3.5" aria-hidden="true" />
              {t("settings.project.backToBoard")}
            </Link>
          </Button>
        </div>
      </main>
    );
  }

  const isDirty =
    name !== project.name || description !== (project.description ?? "");

  // Après suppression : purge le cache et retourne au kanban
  // (redirigé vers le premier projet restant).
  const handleProjectDeleted = () => {
    queryClient.setQueryData<Project[]>(["projects"], (current) =>
      current?.filter((item) => item.id !== project.id),
    );
    queryClient.removeQueries({ queryKey: ["tasks"] });
    queryClient.removeQueries({ queryKey: ["archived"] });
    navigate({ to: "/kanban" });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanName = name.trim();
    if (!cleanName || isSaving || !isDirty) return;

    setIsSaving(true);
    setFeedback(null);
    try {
      const updatedProject = await updateProject(project.id, {
        name: cleanName,
        description: description.trim() || null,
      });
      queryClient.setQueryData<Project[]>(["projects"], (current) =>
        current?.map((item) =>
          item.id === updatedProject.id ? updatedProject : item,
        ),
      );
      setHasEdits(false);
      setFeedback("saved");
    } catch {
      setFeedback("error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="h-full overflow-y-auto bg-surface-workspace scrollbar-thin">
      <div className="mx-auto w-full max-w-2xl px-6 py-8 md:px-10">
        <Link
          to="/kanban/$projectSlug"
          params={{ projectSlug }}
          className="inline-flex items-center gap-1.5 rounded-md text-xs text-text-label transition-colors hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          {t("settings.project.backToBoard")}
        </Link>

        <header className="mt-6 mb-8">
          <h1 className="text-xs font-semibold uppercase tracking-wide text-text-label">
            {t("settings.projectSettings")}
          </h1>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <section
            aria-label={t("settings.general.information")}
            className="space-y-5 rounded-xl border border-border bg-surface-card p-4"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="project-name"
                  className="text-sm font-medium text-text-primary"
                >
                  {t("settings.general.projectName")}
                </label>
                <span
                  aria-hidden="true"
                  className="font-mono text-[11px] text-text-muted-hard"
                >
                  {name.length} / {NAME_MAX}
                </span>
              </div>
              <Input
                id="project-name"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  setHasEdits(true);
                  setFeedback(null);
                }}
                maxLength={NAME_MAX}
                placeholder={t("settings.general.projectNamePlaceholder")}
                required
                autoComplete="off"
                className={fieldClassName}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="project-description"
                  className="text-sm font-medium text-text-primary"
                >
                  {t("settings.general.descriptionLabel")}
                </label>
                <span
                  aria-hidden="true"
                  className="font-mono text-[11px] text-text-muted-hard"
                >
                  {description.length} / {DESCRIPTION_MAX}
                </span>
              </div>
              <textarea
                id="project-description"
                value={description}
                onChange={(event) => {
                  setDescription(event.target.value);
                  setHasEdits(true);
                  setFeedback(null);
                }}
                maxLength={DESCRIPTION_MAX}
                rows={4}
                placeholder={t("settings.general.descriptionPlaceholder")}
                className={cn(
                  fieldClassName,
                  "h-32 max-h-32 resize-none overflow-y-auto",
                )}
              />
            </div>
          </section>

          <div className="flex items-center justify-between gap-4">
            {feedback === "saved" ? (
              <p
                role="status"
                className="flex items-center gap-1.5 text-xs text-primary"
              >
                <CheckCircle className="size-3.5 shrink-0" aria-hidden="true" />
                {t("settings.saved")}
              </p>
            ) : feedback === "error" ? (
              <p
                role="alert"
                className="flex items-center gap-1.5 text-xs text-destructive"
              >
                <CircleAlert className="size-3.5 shrink-0" aria-hidden="true" />
                {t("settings.project.saveError")}
              </p>
            ) : (
              <span />
            )}
            <Button
              type="submit"
              disabled={isSaving || !isDirty || !name.trim()}
            >
              {isSaving ? t("settings.saving") : t("settings.save")}
            </Button>
          </div>
        </form>

        {/* Zone dangereuse — suppression définitive avec double confirmation */}
        <section
          aria-label={t("settings.dangerZone.title")}
          className="mt-10 rounded-xl border border-destructive/30 bg-surface-card p-4"
        >
          <h2 className="flex items-center gap-1.5 text-sm font-medium text-destructive">
            <TriangleAlert className="size-4" aria-hidden="true" />
            {t("settings.dangerZone.title")}
          </h2>
          <p className="mt-1 text-xs text-text-label">
            {t("settings.dangerZone.description")}
          </p>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="mt-3 cursor-pointer"
            onClick={() => setIsDeleteOpen(true)}
          >
            <Trash2 className="size-3.5" aria-hidden="true" />
            {t("settings.dangerZone.deleteProject")}
          </Button>
        </section>

        <DeleteProjectDialog
          open={isDeleteOpen}
          onOpenChange={setIsDeleteOpen}
          project={project}
          onDeleted={handleProjectDeleted}
        />
      </div>
    </main>
  );
}
