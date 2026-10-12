import type { ColumnHeaderProps } from "@packages/shared/types/components/index";
import { Archive, Plus } from "lucide-react";
import { Button } from "@/src/layout/components/ui/button";
import { Skeleton } from "@/src/layout/components/ui/skeleton";

type Props = ColumnHeaderProps & { onArchiveView?: (() => void) | undefined };

export default function ColumnHeader({
  cfg,
  tasks,
  onAddTask,
  onArchiveView,
}: Props) {
  const isLoading = !tasks;
  return (
    <header className="relative flex items-center justify-center gap-4 flex-shrink-0 px-2 py-3.5 min-h-[52px] border-b border-black/10 dark:border-white/15">
      {isLoading ? (
        <div className="flex items-center gap-3">
          <Skeleton className="h-3.5 w-16" />
          <Skeleton className="size-5 rounded-full" />
        </div>
      ) : (
        <div className="flex items-center gap-3 flex-1">
          <div className="flex-1" />
          <div className="flex items-center gap-2.5">
            <h2 className="font-mono text-[14px] font-bold tracking-[0.12em] uppercase whitespace-nowrap">
              {cfg.title}
            </h2>
            <span className="inline-flex items-center justify-center bg-muted dark:bg-surface-hover/80 rounded-full min-w-[22px] h-5.5 px-1.5 text-[11px] font-bold tabular-nums">
              {tasks?.length ?? 0}
            </span>
          </div>
          <div className="flex items-center flex-1 justify-end">
            {onArchiveView ? (
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={onArchiveView}
                onPointerDown={(e) => e.stopPropagation()}
                aria-label={`Voir les archives ${cfg.title}`}
                className="w-7 h-7 text-muted-foreground hover:text-foreground"
              >
                <Archive width={15} height={15} strokeWidth={2} />
              </Button>
            ) : onAddTask ? (
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={onAddTask}
                aria-label={`Ajouter une tâche dans ${cfg.title}`}
                className="w-7 h-7 cursor-pointer"
              >
                <Plus width={15} height={15} strokeWidth={2.5} />
              </Button>
            ) : null}
          </div>
        </div>
      )}
    </header>
  );
}
