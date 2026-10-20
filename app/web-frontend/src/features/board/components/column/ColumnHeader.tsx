import type { ColumnHeaderProps } from "@packages/shared/types/components/index";
import { Archive } from "lucide-react";
import { Button } from "@/src/layout/components/ui/button";
import { Skeleton } from "@/src/layout/components/ui/skeleton";

type Props = ColumnHeaderProps & { onArchiveView?: (() => void) | undefined };

export default function ColumnHeader({ cfg, tasks, onArchiveView }: Props) {
  const isLoading = !tasks;
  return (
    <header className="flex items-center gap-2 flex-shrink-0 px-3 pt-3 pb-2">
      {isLoading ? (
        <div className="flex items-center gap-3">
          <Skeleton className="h-3.5 w-16" />
          <Skeleton className="size-5 rounded-full" />
        </div>
      ) : (
        <>
          <h2 className="text-sm font-semibold whitespace-nowrap">
            {cfg.title}
          </h2>
          <span className="text-xs text-muted-foreground tabular-nums">
            {tasks?.length ?? 0}
          </span>
          <div className="flex-1" />
          {onArchiveView && (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={onArchiveView}
              onPointerDown={(e) => e.stopPropagation()}
              aria-label="Voir les archives"
              className="size-7 text-muted-foreground hover:text-foreground"
            >
              <Archive width={15} height={15} strokeWidth={2} />
            </Button>
          )}
        </>
      )}
    </header>
  );
}
