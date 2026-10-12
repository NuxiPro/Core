import { type ReactNode, useCallback, useEffect, useRef } from "react";

interface ScrollIndicatorProps {
  children: ReactNode;
  className?: string;
}

export function ScrollIndicator({
  children,
  className = "",
}: ScrollIndicatorProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const updateScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    updateScroll();

    el.addEventListener("scroll", updateScroll, { passive: true });

    const observer = new ResizeObserver(updateScroll);
    observer.observe(el);

    const interval = setInterval(updateScroll, 100);
    setTimeout(() => clearInterval(interval), 1000);

    return () => {
      el.removeEventListener("scroll", updateScroll);
      observer.disconnect();
      clearInterval(interval);
    };
  }, [updateScroll]);

  return (
    <div
      className={`relative flex flex-col h-full min-h-0 group/scroll ${className}`}
    >
      {/* biome-ignore lint/a11y/useSemanticElements: scrollable container with hover scroll indicators */}
      <div
        ref={scrollRef}
        role="region"
        className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 scroll-indicator-scroll"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(0,0,0,0) transparent",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.scrollbarColor =
            "#d1d5db transparent";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.scrollbarColor =
            "rgba(0,0,0,0) transparent";
        }}
        onScroll={(e) => {
          const el = e.currentTarget;
          el.classList.add("scrolling");
          const timerId = setTimeout(
            () => el.classList.remove("scrolling"),
            800,
          );
          (
            el as HTMLElement & { _scrollTimer?: ReturnType<typeof setTimeout> }
          )._scrollTimer = timerId;
        }}
      >
        {children}
      </div>
    </div>
  );
}
