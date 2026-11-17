import type { ArchivedTask } from "@packages/shared/types/task/task";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  Archive,
  Calendar,
  Check,
  ChevronDown,
  RotateCcw,
  Search,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/src/layout/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/layout/components/ui/dropdown-menu";
import { Input } from "@/src/layout/components/ui/input";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/src/layout/components/ui/sheet";

// Dropdown options. To add a new period later, add one line here.
const PERIOD_OPTIONS = [
  { value: "all", labelKey: "archive.allDates" },
  { value: "7d", labelKey: "archive.last7Days" },
  { value: "month", labelKey: "archive.thisMonth" },
] as const;

type Period = (typeof PERIOD_OPTIONS)[number]["value"];

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectName?: string | undefined;
  tasks: ArchivedTask[];
  onRestore: (taskId: string) => void;
};

// True when the task matches the selected period.
function matchPeriod(task: ArchivedTask, period: Period) {
  if (period === "all") return true;
  const date = new Date(task.archivedAt);
  if (period === "7d") {
    return Date.now() - date.getTime() < 7 * 24 * 60 * 60 * 1000;
  }
  // "month": archived during the current calendar month.
  const now = new Date();
  return (
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
}

// "21 Nov 2026" in the active language.
function formatArchivedDate(date: string, language: string) {
  return new Date(date).toLocaleDateString(language, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// One row = title + archive date + restore button.
// Used by both renders (plain list and virtualized list).
function ArchiveRow({
  task,
  t,
  language,
  onRestore,
}: {
  task: ArchivedTask;
  t: ReturnType<typeof useTranslation>["t"];
  language: string;
  onRestore: (taskId: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-5 py-3">
      <div className="min-w-0">
        <p className="truncate text-[13px] font-medium text-foreground">
          {task.title}
        </p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          {t("archive.archivedOn", {
            date: formatArchivedDate(task.archivedAt, language),
          })}
        </p>
      </div>
      {/* Icon only, but always visible (not hover-only). */}
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => onRestore(task.id)}
        aria-label={t("archive.restoreLabel", { title: task.title })}
        className="shrink-0 text-muted-foreground hover:bg-accent hover:text-foreground"
      >
        <RotateCcw className="size-4" aria-hidden="true" />
      </Button>
    </div>
  );
}

/**
 * Archive panel (right side Sheet).
 *
 * Layout, per the mockup:
 * 1. static zone — title, text search, date dropdown;
 * 2. dynamic zone — list of archived tasks.
 */
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
  const scrollRef = useRef<HTMLDivElement>(null);

  // Text search, then period filter, newest first.
  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return tasks
      .filter(
        (task) =>
          (!query || task.title.toLowerCase().includes(query)) &&
          matchPeriod(task, period),
      )
      .sort(
        (a, b) =>
          new Date(b.archivedAt).getTime() - new Date(a.archivedAt).getTime(),
      );
  }, [tasks, q, period]);

  // Above 20 tasks, virtualize (render visible rows only).
  const shouldVirtualize = filtered.length > 20;
  const virtualizer = useVirtualizer({
    count: shouldVirtualize ? filtered.length : 0,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 60,
    overscan: 5,
  });

  // Label shown in the dropdown trigger.
  const currentOption =
    PERIOD_OPTIONS.find((option) => option.value === period) ??
    PERIOD_OPTIONS[0];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        aria-describedby="archive-desc"
        className="w-full max-w-md bg-card border-l border-border-subtle p-0 flex flex-col h-full data-[state=open]:animate-[slideInRight_0.35s_ease-out_forwards] data-[state=closed]:animate-[slideOutRight_0.35s_ease-out_forwards]"
      >
        {/* Screen-reader description. */}
        <SheetDescription id="archive-desc" className="sr-only">
          {t("archive.panelDesc", { projectName: projectName ?? "" })}
        </SheetDescription>

        {/* ── Static zone (1) ── */}
        <div className="flex shrink-0 flex-col gap-3 border-b border-border-subtle px-5 pb-4 pt-5">
          <SheetHeader className="flex-row items-center justify-between space-y-0 p-0">
            <div className="flex min-w-0 items-center gap-2">
              <SheetTitle className="truncate text-sm font-semibold tracking-tight text-foreground">
                {t("archive.title")}
              </SheetTitle>
              {/* Count of visible tasks. */}
              <span
                aria-live="polite"
                className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium tabular-nums text-muted-foreground"
              >
                {filtered.length}
              </span>
            </div>
            <SheetClose asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                aria-label={t("archive.close")}
                className="text-muted-foreground hover:bg-muted hover:text-foreground"
              />
            </SheetClose>
          </SheetHeader>

          {projectName && (
            <p className="truncate text-xs text-muted-foreground">
              {projectName}
            </p>
          )}

          {/* Text search. */}
          <label htmlFor="archive-search" className="sr-only">
            {t("archive.searchLabel")}
          </label>
          <div className="relative">
            <Search
              className="absolute left-3 top-2.5 size-4 text-muted-foreground"
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
              className="h-9 rounded-lg border-transparent bg-muted pl-9 text-foreground placeholder:text-muted-foreground focus:border-border-subtle"
            />
          </div>

          {/* Date filter — single dropdown, options live in PERIOD_OPTIONS. */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                aria-label={t("archive.periodLabel")}
                className="h-9 w-full justify-between rounded-lg bg-muted px-3 text-xs font-medium text-foreground hover:bg-muted/80"
              >
                <span className="inline-flex min-w-0 items-center gap-2">
                  <Calendar
                    className="size-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <span className="truncate">{t(currentOption.labelKey)}</span>
                </span>
                <ChevronDown
                  className="size-4 text-muted-foreground"
                  aria-hidden="true"
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-[var(--radix-dropdown-menu-trigger-width)]"
            >
              <DropdownMenuGroup>
                {PERIOD_OPTIONS.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onSelect={() => setPeriod(option.value)}
                  >
                    {/* Check mark on the active option (keeps labels aligned). */}
                    <Check
                      className={`size-4 ${
                        option.value === period ? "opacity-100" : "opacity-0"
                      }`}
                      aria-hidden="true"
                    />
                    {t(option.labelKey)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* ── Dynamic zone (2): the archived tasks ── */}
        <section
          ref={scrollRef}
          aria-label={t("archive.title")}
          className="flex-1 overflow-y-auto overscroll-contain"
        >
          {filtered.length ? (
            shouldVirtualize ? (
              // Virtualized render: same rows, positioned absolutely.
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
                      className="border-b border-border-subtle"
                    >
                      <ArchiveRow
                        task={task}
                        t={t}
                        language={i18n.language}
                        onRestore={onRestore}
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              // Plain render: hairline separators between rows.
              <ul className="divide-y divide-border-subtle">
                {filtered.map((task) => (
                  <li key={task.id}>
                    <ArchiveRow
                      task={task}
                      t={t}
                      language={i18n.language}
                      onRestore={onRestore}
                    />
                  </li>
                ))}
              </ul>
            )
          ) : (
            // Empty state.
            <div className="flex h-full flex-col items-center justify-center px-6 text-center">
              <div className="rounded-full bg-muted p-3.5">
                <Archive
                  className="size-5 text-muted-foreground"
                  aria-hidden="true"
                />
              </div>
              <p className="mt-3 text-sm font-medium text-foreground">
                {t("archive.emptyTitle")}
              </p>
              <p className="mt-1 max-w-[240px] text-xs leading-relaxed text-muted-foreground">
                {t("archive.emptyDesc")}
              </p>
            </div>
          )}
        </section>
      </SheetContent>
    </Sheet>
  );
}
