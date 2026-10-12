import { createFileRoute, redirect } from "@tanstack/react-router";
import { getWorkspaces } from "@/src/features/board/api/workspaces";

export const Route = createFileRoute("/_dashboard/")({
  loader: async () => {
    const workspaces = await getWorkspaces();
    if (!workspaces || workspaces.length === 0) {
      throw redirect({ to: "/onboarding" });
    }

    // Redirige vers /kanban → KanbanIndex utilise useProjects() (cache React Query)
    throw redirect({ to: "/kanban" });
  },
  component: () => null,
});
