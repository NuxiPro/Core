import { Skeleton } from "./ui/skeleton";

export function KanbanSkeleton() {
  return (
    <div className="h-full min-h-0 w-full flex flex-col gap-4 p-4 overflow-hidden">
      {/* Header skeleton */}
      <div className="flex items-center justify-between gap-2">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>

      {/* Kanban columns skeleton */}
      <div className="flex gap-4 flex-1 overflow-x-auto min-h-0">
        {Array.from({ length: 3 }).map((_, colIdx) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton items are static
            key={colIdx}
            className="flex flex-col gap-2 flex-shrink-0 w-96 min-h-0"
          >
            {/* Column header */}
            <div className="flex items-center justify-between px-2 py-1">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-6" />
            </div>

            {/* Column cards */}
            <div className="flex-1 space-y-2 overflow-y-auto">
              {Array.from({ length: 4 }).map((_, cardIdx) => (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: skeleton items are static
                  key={cardIdx}
                  className="space-y-2 p-2 bg-surface-card rounded-md"
                >
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                  <div className="flex gap-1 pt-2">
                    <Skeleton className="h-6 w-6 rounded" />
                    <Skeleton className="h-6 w-6 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
