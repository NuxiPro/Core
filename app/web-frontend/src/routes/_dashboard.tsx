import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { Scale } from "lucide-react";
import { useEffect } from "react";
import { useSyncLanguage } from "@/src/shared/hooks/useSyncLanguage";
import { resolveSession } from "@/src/shared/lib/auth-guard";
import { AppBreadcrumb } from "../layout/breadcrumb/app-breadcrumb";
import { RateLimitBanner } from "../layout/components/animation/rate-limit-banner";
import {
  SidebarProvider,
  SidebarTrigger,
} from "../layout/components/ui/sidebar";
import { AppSidebar } from "../layout/sidebar/app-sidebar";

export const Route = createFileRoute("/_dashboard")({
  loader: async () => {
    const session = await resolveSession();
    if (!session) throw redirect({ to: "/login" });
    return { session };
  },
  component: DashboardLayout,
});

function DashboardLayout() {
  useSyncLanguage();
  useEffect(() => {
    window.dispatchEvent(new Event("app-ready"));
  }, []);

  return (
    <div className="animate-[fadeIn_0.4s_ease-out_forwards] w-full h-full flex">
      <SidebarProvider>
        <AppSidebar />
        <main className="flex-1 min-w-0 flex flex-col">
          <div className="flex-1 min-h-0 bg-surface-workspace overflow-hidden flex flex-col rounded-xl m-1.5 border border-border-subtle/50 shadow-lg shadow-black/10 dark:shadow-black/30 relative z-10">
            <header className="h-11 flex items-center px-4 border-b border-border-subtle gap-2 shrink-0">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <SidebarTrigger className="shrink-0 text-text-label hover:text-text-primary" />
                <div className="h-3 w-px bg-border-subtle mx-1 shrink-0" />
                <AppBreadcrumb />
              </div>
            </header>
            <div className="flex-1 min-h-0 overflow-hidden">
              <div className="px-3 pt-2 shrink-0">
                <RateLimitBanner />
              </div>
              <Outlet />
            </div>
          </div>
        </main>
      </SidebarProvider>
    </div>
  );
}
