/**
 * /kanban/$projectSlug Route
 *
 * Route dynamique — le slug encode le nom du projet.
 * Ex: /kanban/marketing-q3-a671
 */

import { createFileRoute, Outlet } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { KanbanSkeleton } from "../../layout/components/kanban-skeleton";

const KanbanBoard = lazy(() =>
  import("../../features/board/components/KanbanBoard").then((m) => ({
    default: m.KanbanBoard,
  })),
);

export const Route = createFileRoute("/_dashboard/kanban/$projectSlug")({
  component: KanbanRoute,
});

function KanbanRoute() {
  return (
    <>
      <Suspense fallback={<KanbanSkeleton />}>
        <KanbanBoard />
      </Suspense>
      <Outlet />
    </>
  );
}
