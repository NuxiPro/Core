/**
 * /onboarding Route
 *
 * Page d'onboarding — wizard multi-étapes pour créer le premier projet.
 */

import { createFileRoute, redirect } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { resolveSession } from "@/src/shared/lib/auth-guard";
import { getWorkspaces } from "../features/board/api/workspaces";

const OnboardingWizard = lazy(() =>
  import("../features/onboarding/OnboardingWizard").then((m) => ({
    default: m.OnboardingWizard,
  })),
);

export const Route = createFileRoute("/onboarding")({
  validateSearch: (search: Record<string, unknown>) => ({
    error: typeof search.error === "string" ? search.error : undefined,
  }),
  loader: async ({ location }) => {
    const queryString = location.href.split("?", 2)[1]?.split("#", 1)[0] ?? "";
    const error = new URLSearchParams(queryString).get("error");

    // Expired or invalid magic link: dedicated feedback page.
    if (error) {
      throw redirect({ to: "/link-expired" });
    }
    const session = await resolveSession();
    if (!session) {
      throw redirect({ to: "/login" });
    }

    const workspaces = await getWorkspaces();
    if (workspaces.length > 0) {
      throw redirect({ to: "/kanban" });
    }

    return { session };
  },
  component: OnboardingPage,
});

function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-surface-root flex items-center justify-center">
          <div className="text-sm text-text-label">loading...</div>
        </div>
      }
    >
      <OnboardingWizard />
    </Suspense>
  );
}
