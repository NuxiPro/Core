import type { ArchivedTask } from "@packages/shared/types/task/task";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Archive, Calendar, RotateCcw, Search } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/src/layout/components/ui/button";
import { Input } from "@/src/layout/components/ui/input";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/src/layout/components/ui/sheet";

type Period = "all" | "7d" | "month"; // code hardcoded (à modifier)
type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectName?: string | undefined;
  tasks: ArchivedTask[];
  onRestore: (taskId: string) => void;
};

function useArchiveFilter(tasks: ArchivedTask[], q: string, period: Period) {
  return useMemo(() => {
    return tasks.filter((t) => {
      if (q && !t.title.toLowerCase().includes(q.toLowerCase())) return false;
      if (period === "all") return true;
      const d = new Date(t.archivedAt);
      const now = new Date();
      if (period === "7d") return now.getTime() - d.getTime() <= 7 * 86400000;
      return (
        d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      );
    });
  }, [tasks, q, period]);
}

export function ArchiveSheet({
  open,
  onOpenChange,
  projectName,
  tasks,
  onRestore,
}: Props) {
  const { t, i18n } = useTranslation();
  const [q, setQ] = useState("");
  const [period, setPeriod] = useState<Period>("all");
  const filtered = useArchiveFilter(tasks, q, period);
  const scrollRef = useRef<HTMLDivElement>(null);
  const shouldVirtualize = filtered.length > 20;
  const virtualizer = useVirtualizer({
    count: shouldVirtualize ? filtered.length : 0,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 72,
    overscan: 5,
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        aria-describedby="archive-desc"
        className="w-full max-w-md bg-card border-l border-border-subtle p-0 flex flex-col h-full data-[state=open]:animate-[slideInRight_0.35s_ease-out_forwards] data-[state=closed]:animate-[slideOutRight_0.35s_ease-out_forwards]"
      >
        <SheetDescription id="archive-desc" className="sr-only">
          {t("archive.panelDesc", { projectName: projectName ?? "" })}
        </SheetDescription>

        <SheetHeader className="flex-row items-center justify-between px-5 py-4 border-b border-border-subtle space-y-0 shrink-0">
          <SheetTitle className="flex items-center gap-2 text-[13px] font-medium tracking-tight text-foreground">
            <span className="truncate">
              {projectName ?? t("archive.title")}
            </span>
            <Archive
              className="size-3.5 text-muted-foreground shrink-0"
              aria-hidden="true"
            />
            <span
              aria-live="polite"
              className="rounded-full bg-muted text-muted-foreground px-2 py-0.5 text-[11px] font-medium tabular-nums"
            >
              {filtered.length}
            </span>
          </SheetTitle>
          <SheetClose asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              aria-label={t("archive.close")}
              className="text-muted-foreground hover:text-foreground hover:bg-muted"
            />
          </SheetClose>
        </SheetHeader>

        <div className="px-5 py-3 flex flex-col gap-2.5 border-b border-border-subtle shrink-0">
          <label htmlFor="archive-search" className="sr-only">
            {t("archive.searchLabel")}
          </label>
          <div className="relative">
            <Search
              className="absolute left-2.5 top-2.5 size-4 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="archive-search"
              type="search"
              autoComplete="off"
              placeholder={t("archive.searchPlaceholder")}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label={t("archive.searchLabel")}
              className="pl-8 h-9 bg-muted border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Calendar
                className="absolute left-2.5 top-2.5 size-4 text-muted-foreground pointer-events-none"
                aria-hidden="true"
              />
              <select  // code hardcoded (à modifier)
                value={period}
                onChange={(e) => setPeriod(e.target.value as Period)}
                aria-label={t("archive.periodLabel")}
                className="w-full h-9 rounded-lg bg-muted border border-border pl-8 pr-8 text-sm text-foreground appearance-none focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="all">{t("archive.allDates")}</option>
                <option value="7d">{t("archive.last7Days")}</option>
                <option value="month">{t("archive.thisMonth")}</option>
              </select>
              <span
                className="pointer-events-none absolute right-2.5 top-3 text-muted-foreground text-xs"
                aria-hidden="true"
              >
                ▾
              </span>
            </div>
          </div>
        </div>

        <div
          ref={scrollRef}
          aria-label={t("archive.title")}
          className="flex-1 overflow-y-auto p-5 overscroll-contain"
        >
          {filtered.length ? (
            shouldVirtualize ? (
              <div
                className="relative w-full"
                style={{ height: virtualizer.getTotalSize() }}
              >
                {virtualizer.getVirtualItems().map((row) => {
                  const task = filtered[row.index];
                  return (
                    <div
                      key={task.id}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        transform: `translateY(${row.start}px)`,
                      }}
                      className="pb-2"
                    >
                      <div className="flex items-center justify-between gap-3 rounded-xl border border-border-subtle bg-card px-3 py-2.5 shadow-sm">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">
                            {task.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {t("archive.archivedOn", {    // code hardcoded (à modifier)
                              date: new Date(
                                task.archivedAt,
                              ).toLocaleDateString(i18n.language, {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              }),
                            })}
                          </p>
                        </div>
                        <Button
                          type="button"
                          onClick={() => onRestore(task.id)}
                          aria-label={t("archive.restoreLabel", {
                            title: task.title,
                          })}
                          className="h-8 px-2.5 gap-1.5 bg-muted hover:bg-accent text-foreground border border-border-subtle shrink-0"
                        >
                          <RotateCcw className="size-3.5" aria-hidden="true" />
                          {t("archive.restore")}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <ul className="space-y-2">
                {filtered.map((task) => (
                  <li
                    key={task.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border-subtle bg-card px-3 py-2.5 shadow-sm"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {task.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t("archive.archivedOn", {     // code hardcoded (à modifier)
                          date: new Date(task.archivedAt).toLocaleDateString(
                            i18n.language,
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            },
                          ),
                        })}
                      </p>
                    </div>
                    <Button
                      type="button"
                      onClick={() => onRestore(task.id)}
                      aria-label={t("archive.restoreLabel", {
                        title: task.title,
                      })}
                      className="h-8 px-2.5 gap-1.5 bg-muted hover:bg-accent text-foreground border border-border-subtle shrink-0"
                    >
                      <RotateCcw className="size-3.5" aria-hidden="true" />
                      {t("archive.restore")}
                    </Button>
                  </li>
                ))}
              </ul>
            )
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-3 rounded-2xl bg-muted p-4">
                <Archive
                  className="size-6 text-muted-foreground"
                  aria-hidden="true"
                />
              </div>
              <p className="text-sm font-medium text-foreground">
                {t("archive.emptyTitle")}
              </p>
              <p className="mt-1 max-w-[260px] text-xs leading-relaxed text-muted-foreground">
                {t("archive.emptyDesc")}
              </p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
