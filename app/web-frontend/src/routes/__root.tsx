import { createRootRoute, Outlet } from "@tanstack/react-router";
import * as React from "react";
import { useTheme } from "@/src/shared/hooks/useTheme";
import { ErrorBoundary } from "../layout/components/ErrorBoundary";
import { TooltipProvider } from "../layout/components/ui/tooltip";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Cloud NuxiPro" },
    ],
    links: [
      {
        rel: "icon",
        type: "image/svg+xml",
        href: "/icon.svg",
      },
    ],
  }),
  component: RootLayout,
});

function RootLayout() {
  useTheme();
  React.useEffect(() => {
    window.dispatchEvent(new Event("app-ready"));
  }, []);
  return (
    <div className="bg-surface-root w-screen h-screen flex overflow-hidden">
      <TooltipProvider delayDuration={0}>
        <React.Suspense
          fallback={
            <div className="h-screen w-screen flex items-center justify-center bg-surface-root">
              <div className="w-5 h-5 border-2 border-border border-t-foreground rounded-full animate-spin" />
            </div>
          }
        >
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </React.Suspense>
      </TooltipProvider>
    </div>
  );
}
