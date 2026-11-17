import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const ProjectSettingsPage = lazy(() =>
  import("@/src/features/project-settings/ProjectSettingsPage").then(
    (module) => ({
      default: module.ProjectSettingsPage,
    }),
  ),
);

export const Route = createFileRoute(
  "/_dashboard/kanban/$projectSlug/settings",
)({
  component: ProjectSettingsRoute,
});

function ProjectSettingsRoute() {
  const { projectSlug } = Route.useParams();

  return (
    <Suspense fallback={null}>
      {/* key : réinitialise le formulaire (saisie, feedback) à chaque projet */}
      <ProjectSettingsPage key={projectSlug} projectSlug={projectSlug} />
    </Suspense>
  );
}
