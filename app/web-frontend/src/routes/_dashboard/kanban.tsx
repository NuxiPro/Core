/**
 * /kanban Route (layout)
 *
 * Route parente — rend le child route via <Outlet />.
 * Le redirect /kanban → /kanban/{slug} est dans kanban.index.tsx.
 */

import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/kanban")({
  component: KanbanLayout,
});

function KanbanLayout() {
  return <Outlet />;
}
