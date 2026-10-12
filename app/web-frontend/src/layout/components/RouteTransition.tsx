import { useLocation } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

export function RouteTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [stage, setStage] = useState<"enter" | "idle" | "exit">("idle");
  const prevPath = useRef(location.pathname);

  useEffect(() => {
    const isArchive =
      location.pathname.endsWith("/archive") ||
      prevPath.current.endsWith("/archive");
    if (location.pathname !== prevPath.current && !isArchive) {
      prevPath.current = location.pathname;
      setStage("exit");
    } else {
      prevPath.current = location.pathname;
    }
  }, [location.pathname]);

  useEffect(() => {
    if (stage === "exit") {
      const timeout = setTimeout(() => {
        setDisplayChildren(children);
        setStage("enter");
      }, 80);
      return () => clearTimeout(timeout);
    }
    if (stage === "enter") {
      const timeout = setTimeout(() => {
        setStage("idle");
      }, 120);
      return () => clearTimeout(timeout);
    }
  }, [stage, children]);

  return (
    <div
      className={`h-full w-full transition-all duration-[120ms] ease-[cubic-bezier(0.2,0,0,1)] ${
        stage === "exit" ? "opacity-0 scale-[0.99]" : "opacity-100 scale-100"
      }`}
      style={{ pointerEvents: stage === "exit" ? "none" : "auto" }}
    >
      {displayChildren}
    </div>
  );
}
