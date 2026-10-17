import type { BoardScrollContainerProps as SharedBoardScrollContainerProps } from "@packages/shared/types/components";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { Button } from "@/src/layout/components/ui/button";

// Affine `children: unknown` (shared agnostique) en `ReactNode` côté frontend
type BoardScrollContainerProps = Omit<
  SharedBoardScrollContainerProps,
  "children"
> & {
  children: ReactNode;
};

export function BoardScrollContainer({
  children,
  showArrows = true,
}: BoardScrollContainerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 5);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 5);
  }, []);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update]);

  const scroll = (dir: "left" | "right") =>
    ref.current?.scrollBy({
      left: dir === "left" ? -360 : 360,
      behavior: "smooth",
    });

  return (
    <div className="relative group h-full min-h-0">
      {canLeft && (
        <div
          className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none z-10"
          aria-hidden="true"
        />
      )}
      {canRight && (
        <div
          className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none z-10"
          aria-hidden="true"
        />
      )}

      <section
        ref={ref}
        className="w-full h-full overflow-x-auto overflow-y-hidden pb-2 scroll-smooth snap-x snap-mandatory [scrollbar-width:thin] touch-pan-x"
        style={{ scrollbarGutter: "stable both-edges" }}
        aria-label="Horizontally scrollable task board"
      >
        <div className="flex gap-[clamp(12px,2vw,24px)] px-[clamp(12px,2vw,32px)] py-[clamp(12px,1.5vw,24px)] w-full h-full">
          {children}
        </div>
      </section>

      {showArrows && (
        <div className="hidden lg:block">
          {canLeft && (
            <Button
              onClick={() => scroll("left")}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] rounded-full h-9 w-9 bg-background/80 backdrop-blur-sm border shadow-sm"
              aria-label="Scroll board left"
            >
              <ChevronLeft width={18} height={18} />
            </Button>
          )}
          {canRight && (
            <Button
              onClick={() => scroll("right")}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] rounded-full h-9 w-9 bg-background/80 backdrop-blur-sm border shadow-sm"
              aria-label="Scroll board right"
            >
              <ChevronRight width={18} height={18} />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
