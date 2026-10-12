/**
 * /kanban Route (index — sans slug)
 *
 * Redirige vers le premier projet par slug.
 * Si aucun projet, ouvre le dialog de création automatiquement.
 */

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { useProjects } from "@/src/features/board/hooks/useProjects";
import { NewProjectDialog } from "@/src/layout/sidebar/new-project-dialog";

export const Route = createFileRoute("/_dashboard/kanban/")({
  component: KanbanIndex,
});

function KanbanIndex() {
  const navigate = useNavigate();
  const { projects, isLoading } = useProjects();
  const hasNavigated = useRef(false);

  useEffect(() => {
    if (isLoading) return;
    if (hasNavigated.current) return;
    if (projects.length === 0) return;

    hasNavigated.current = true;
    const first = projects[0];
    navigate({
      to: "/kanban/$projectSlug",
      params: { projectSlug: first.slug },
      replace: true,
    });
  }, [projects, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="h-full min-h-0 w-full flex items-center justify-center">
        <div className="text-sm text-text-muted">Chargement...</div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="h-full min-h-0 w-full flex items-center justify-center">
        <NewProjectDialog
          forceOpen
          onCreated={(projectId) => {
            const project = projects.find((p) => p.id === projectId);
            if (project) {
              navigate({
                to: "/kanban/$projectSlug",
                params: { projectSlug: project.slug },
              });
            }
          }}
        />
      </div>
    );
  }

  return null;
}
