import "./src/features/i18n/index";
import { QueryClientProvider } from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { queryClient } from "@/src/shared/lib/queryClient";
import { routeTree } from "./routeTree.gen";
import "./global.css";

const router = createRouter({ routeTree, defaultPreload: "intent" });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const root = document.getElementById("root") as HTMLElement;

ReactDOM.createRoot(root).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);

const loader = document.getElementById("root-loader");
if (loader) {
  const hide = () => {
    if (loader.classList.contains("nova")) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Nova: flash + fade de la même respiration — le burst coïncide avec l'apparition de l'app
    loader.classList.add("nova", "is-hiding");
    const delay = reduce ? 0 : 460;
    setTimeout(() => loader.remove(), delay);
  };
  window.addEventListener("app-ready", hide, { once: true });
  setTimeout(hide, 3000);
}
