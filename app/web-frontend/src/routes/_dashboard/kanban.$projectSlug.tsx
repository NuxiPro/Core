/**
 * /kanban/$projectSlug Route
 *
 * Route dynamique — le slug encode le nom du projet.
 * Ex: /kanban/marketing-q3-a671
 */

import { createFileRoute, Outlet, useMatches } from "@tanstack/react-router";
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
  // /settings est une page pleine écran : elle remplace le board.
  // (Contrairement à /archive qui s'affiche en superposition par-dessus.)
  const matches = useMatches();
  const isSettingsOpen = matches.some(
    (match) => match.routeId === "/_dashboard/kanban/$projectSlug/settings",
  );

  return (
    <>
      {!isSettingsOpen && (
        <Suspense fallback={<KanbanSkeleton />}>
          <KanbanBoard />
        </Suspense>
      )}
      <Outlet />
    </>
  );
}
