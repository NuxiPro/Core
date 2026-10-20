import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { getArchivedTasks, restoreTask } from "@/src/features/archive/api";

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

  const { data: tasks = [] } = useQuery({
    queryKey: ["archived", projectSlug],
    queryFn: () => getArchivedTasks(projectSlug),
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
          await restoreTask(id);
          qc.invalidateQueries({ queryKey: ["archived", projectSlug] });
          qc.invalidateQueries({ queryKey: ["tasks"] });
        }}
      />
    </Suspense>
  );
}
