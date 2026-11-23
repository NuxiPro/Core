import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { lazy, Suspense, useMemo } from "react";
import {
  getArchivedTasks,
  restoreTask,
} from "@/src/features/archive/api/ArchiveApi";
import { useProjects } from "@/src/features/board/hooks/useProjects";
import { findProjectBySlug } from "@/src/shared/utils/utils";

const ArchiveSheet = lazy(() =>
  import("@/src/features/archive/ArchiveSheet").then((m) => ({
    default: m.ArchiveSheet,
  })),
);

export const Route = createFileRoute("/_dashboard/kanban/$projectSlug/archive")(
  {
    component: ArchiveRoute,
  },
);

function ArchiveRoute() {
  const { projectSlug } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  // Same slug → id resolution as KanbanBoard: the archive API speaks UUIDs.
  const { projects } = useProjects();
  const projectId = useMemo(
    () => findProjectBySlug(projects, projectSlug)?.id ?? null,
    [projects, projectSlug],
  );

  const requireProjectId = () => {
    if (!projectId) throw new Error("A project is required");
    return projectId;
  };

  // Archived list: disabled until the project is resolved.
  // refetchOnMount must opt out of the global default (false): when the
  // sheet opens after a task was archived, the list was invalidated while
  // this route was unmounted — the stale cache must refresh here, or the
  // user sees the old list until a full page reload.
  const { data: tasks = [] } = useQuery({
    queryKey: ["archived", projectId],
    queryFn: () => getArchivedTasks(requireProjectId()),
    enabled: !!projectId,
    refetchOnMount: true,
  });

  const close = () =>
    navigate({ to: "/kanban/$projectSlug", params: { projectSlug } });

  return (
    <Suspense fallback={null}>
      <ArchiveSheet
        open
        onOpenChange={(o) => !o && close()}
        tasks={tasks}
        onRestore={async (id) => {
          try {
            await restoreTask(id);
          } catch {
            // restoreTask already logged the error — swallow it so a failed
            // restore never surfaces as an unhandled rejection in the console.
            return;
          }
          qc.invalidateQueries({ queryKey: ["archived", projectId] });
          // The board cache lives under ["board", projectId] (useTasks) —
          // refreshing it brings the restored task back on the kanban.
          qc.invalidateQueries({ queryKey: ["board", projectId] });
        }}
      />
    </Suspense>
  );
}
