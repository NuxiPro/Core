import { createRootRoute, Outlet } from "@tanstack/react-router";
import * as React from "react";
import { useTheme } from "@/src/shared/hooks/useTheme";
import { ErrorBoundary } from "../layout/components/ErrorBoundary";
import { RouteTransition } from "../layout/components/RouteTransition";
import { TooltipProvider } from "../layout/components/ui/tooltip";

const TanStackRouterDevtools = import.meta.env.DEV
  ? React.lazy(() =>
      import("@tanstack/react-router-devtools").then((m) => ({
        default: m.TanStackRouterDevtools,
      })),
    )
  : () => null;

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "NuxiPro" },
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
  return (
    <div className="bg-surface-root w-screen h-screen flex overflow-hidden">
      <TooltipProvider delayDuration={0}>
        <React.Suspense
          fallback={
            <div className="h-screen w-screen flex items-center justify-center bg-[#010102]">
              <div className="w-5 h-5 border-2 border-[#23252a] border-t-[#f7f8f8] rounded-full animate-spin" />
            </div>
          }
        >
          <ErrorBoundary>
            <RouteTransition>
              <Outlet />
            </RouteTransition>
          </ErrorBoundary>
        </React.Suspense>
      </TooltipProvider>
      <React.Suspense fallback={null}>
        <TanStackRouterDevtools position="bottom-right" />
      </React.Suspense>
    </div>
  );
}
