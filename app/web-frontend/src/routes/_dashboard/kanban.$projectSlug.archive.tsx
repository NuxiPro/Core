import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { lazy, Suspense, useMemo, useState } from "react";
import {
  deleteArchivedTask,
  getArchivedTask,
  getArchivedTasks,
  restoreTask,
  updateArchivedTask,
} from "@/src/features/archive/api/ArchiveApi";
import { useProjects } from "@/src/features/board/hooks/useProjects";
import { findProjectBySlug } from "@/src/shared/utils/utils";

const ArchiveSheet = lazy(() =>
  import("@/src/features/archive/ArchiveSheet").then((m) => ({
    default: m.ArchiveSheet,
  })),
);

const ArchiveTaskDialog = lazy(() =>
  import("@/src/features/archive/ArchiveTaskDialog").then((m) => ({
    default: m.ArchiveTaskDialog,
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

  // Task opened in the popup (id only: the data comes from the queries below).
  const [selectedId, setSelectedId] = useState<string | null>(null);

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

  // Summary (title only) comes from the archived list…
  const summary = useMemo(
    () => tasks.find((task) => task.id === selectedId),
    [tasks, selectedId],
  );

  // …the full detail is fetched only when the user opens a task.
  // While it loads, the dialog shows the summary + loader.
  // Archive detail endpoint: an archived row is no longer in `cards`,
  // so the board getTask endpoint would 404.
  const { data: detail } = useQuery({
    queryKey: ["archive-detail", selectedId],
    queryFn: () => getArchivedTask(selectedId as string),
    enabled: !!selectedId,
  });

  const selectedTask = detail ?? summary;

  const close = () =>
    navigate({ to: "/kanban/$projectSlug", params: { projectSlug } });

  return (
    <Suspense fallback={null}>
      <ArchiveSheet
        open
        onOpenChange={(o) => !o && close()}
        tasks={tasks}
        // Opening a task must NOT close the archive (close = navigate away).
        closeOnOpen={false}
        onOpenTask={setSelectedId}
        selectedTaskId={selectedId ?? undefined}
        onRestore={async (id) => {
          try {
            await restoreTask(id);
          } catch {
            // restoreTask already logged the error — swallow it so a failed
            // restore never surfaces as an unhandled rejection in the console.
            return;
          }
          if (id === selectedId) setSelectedId(null);
          qc.invalidateQueries({ queryKey: ["archived", projectId] });
          // The board cache lives under ["board", projectId] (useTasks) —
          // refreshing it brings the restored task back on the kanban.
          qc.invalidateQueries({ queryKey: ["board", projectId] });
        }}
      />

      {/* Rendered NEXT TO the sheet (not inside): own layer, no key conflicts. */}
      {selectedTask && (
        <ArchiveTaskDialog
          // Remount per task so the form state never leaks between tasks.
          key={selectedTask.id}
          task={selectedTask}
          onClose={() => setSelectedId(null)}
          onUpdate={async (id, updates) => {
            // The archive row lives in archived_cards: the board updateTask
            // endpoint (table cards) would 404 — use the archive update.
            await updateArchivedTask(id, updates);
            qc.invalidateQueries({ queryKey: ["archived", projectId] });
            qc.invalidateQueries({ queryKey: ["archive-detail", id] });
          }}
          onDelete={async (id) => {
            await deleteArchivedTask(id);
            setSelectedId(null);
            qc.invalidateQueries({ queryKey: ["archived", projectId] });
            // The row is gone: drop the detail cache instead of
            // refetching an endpoint that would answer 404.
            qc.removeQueries({ queryKey: ["archive-detail", id] });
          }}
        />
      )}
    </Suspense>
  );
}
