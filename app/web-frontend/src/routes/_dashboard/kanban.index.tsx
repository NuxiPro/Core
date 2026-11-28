/**
 * /kanban Route (index — sans slug)
 *
 * Redirige vers le premier projet par slug.
 * Si aucun projet, ouvre le dialog de création automatiquement.
 */

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { FolderPlusIcon } from "lucide-react";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useProjects } from "@/src/features/board/hooks/useProjects";
import { useWorkspaceSelection } from "@/src/features/board/WorkspaceSelectionProvider";
import { NewProjectDialog } from "@/src/layout/sidebar/new-project-dialog";

export const Route = createFileRoute("/_dashboard/kanban/")({
  component: KanbanIndex,
});

function KanbanIndex() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { projects, isLoading, isError } = useProjects();
  const { currentWorkspace, workspacesLoading, workspacesError } =
    useWorkspaceSelection();
  const hasNavigated = useRef(false);
  const workspaceProjects = currentWorkspace
    ? projects.filter((project) => project.workspaceId === currentWorkspace.id)
    : [];

  useEffect(() => {
    if (isLoading || workspacesLoading) return;
    if (hasNavigated.current) return;
    if (workspaceProjects.length === 0) return;

    hasNavigated.current = true;
    const first = workspaceProjects[0];
    navigate({
      to: "/kanban/$projectSlug",
      params: { projectSlug: first.slug },
      replace: true,
    });
  }, [workspaceProjects, isLoading, workspacesLoading, navigate]);

  if (isLoading || workspacesLoading) {
    return (
      <div className="h-full min-h-0 w-full flex items-center justify-center">
        <div className="text-sm text-text-muted">Loading...</div>
      </div>
    );
  }

  if (isError || workspacesError) return null;

  if (workspaceProjects.length === 0) {
    return (
      <div className="h-full min-h-0 w-full flex items-center justify-center px-6 py-12">
        <div className="flex w-full max-w-lg flex-col items-center text-center">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-border-subtle bg-surface-card text-primary shadow-sm">
            <FolderPlusIcon className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-text-primary">
            {t("sidebar.emptyProjectsTitle")}
          </h1>
          <p className="mt-2 max-w-md text-sm leading-6 text-text-label">
            {t("sidebar.emptyProjectsDescription")}
          </p>
          <NewProjectDialog
            forceOpen
            workspaceId={currentWorkspace?.id}
            onCreated={(project) => {
              navigate({
                to: "/kanban/$projectSlug",
                params: { projectSlug: project.slug },
              });
            }}
            trigger={
              <button
                type="button"
                className="mt-6 inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
              >
                <FolderPlusIcon className="h-4 w-4" />
                {t("sidebar.createFirstProject")}
              </button>
            }
          />
        </div>
      </div>
    );
  }

  return null;
}
