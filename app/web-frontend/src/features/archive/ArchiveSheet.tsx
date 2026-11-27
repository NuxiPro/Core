import type { ArchivedTaskSummary } from "@packages/shared/types/task/task";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Archive, RotateCcw, Search, SearchX, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
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

// Period chips. To add a new period later, add one line here.
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
  tasks: ArchivedTaskSummary[];
  onRestore: (taskId: string) => void;
  /** Click on a row. When omitted, rows are not clickable. */
  onOpenTask?: ((taskId: string) => void) | undefined;
  /** Close the panel after opening a task (default: true). Pass false to keep the archive visible behind the popup. */
  closeOnOpen?: boolean | undefined;
  /** Task currently opened in the popup: purely visual highlight, controlled by the parent. */
  selectedTaskId?: string | undefined;
};

const DAY = 86_400_000;
const ROW_HEIGHT = 52;
const HEADER_HEIGHT = 36;
const VIRTUALIZE_ABOVE = 40; // items (rows + headers)

const startOfDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

// True when the task matches the selected period.
function matchPeriod(task: ArchivedTaskSummary, period: Period) {
  if (period === "all") return true;
  const date = new Date(task.archivedAt);
  if (period === "7d") return Date.now() - date.getTime() < 7 * DAY;
  const now = new Date();
  return (
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
}

type GroupKind = "today" | "yesterday" | "week" | "month";

// Which bucket a task falls into ("Today", "Yesterday", "Last 7 days", "November 2026"...).
function groupOf(date: Date, todayStart: number) {
  const diff = Math.round((todayStart - startOfDay(date)) / DAY);
  if (diff <= 0) return { key: "today", kind: "today" as GroupKind };
  if (diff === 1) return { key: "yesterday", kind: "yesterday" as GroupKind };
  if (diff < 7) return { key: "week", kind: "week" as GroupKind };
  return {
    key: `m-${date.getFullYear()}-${date.getMonth()}`,
    kind: "month" as GroupKind,
  };
}

// Short right-hand meta: time for today/yesterday, otherwise a compact date.
function formatMeta(date: Date, kind: GroupKind, language: string) {
  if (kind === "today" || kind === "yesterday") {
    return date.toLocaleTimeString(language, {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  if (kind === "week") {
    return date.toLocaleDateString(language, {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  }
  return date.toLocaleDateString(language, { day: "numeric", month: "short" });
}

type Item =
  | { type: "header"; key: string; label: string; count: number }
  | { type: "task"; key: string; task: ArchivedTaskSummary; meta: string };

// Highlights the first match of the search query inside the title.
function Highlight({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const i = text.toLowerCase().indexOf(query);
  if (i === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark className="rounded-sm bg-primary/15 px-0.5 text-foreground">
        {text.slice(i, i + query.length)}
      </mark>
      {text.slice(i + query.length)}
    </>
  );
}

// One row = [ clickable title + meta ] [ restore ].
// The two actions are siblings (no button inside a button).
function ArchiveRow({
  task,
  meta,
  query,
  selected,
  onOpen,
  onRestore,
}: {
  task: ArchivedTaskSummary;
  meta: string;
  query: string;
  selected: boolean;
  onOpen?: ((taskId: string) => void) | undefined;
  onRestore: (taskId: string) => void;
}) {
  const { t } = useTranslation();

  const content = (
    <>
      <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-foreground">
        <Highlight text={task.title} query={query} />
      </span>
      <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
        {meta}
      </span>
    </>
  );

  // Selected = soft background + thin accent bar on the left (purely visual).
  const mainClass =
    "relative flex h-10 min-w-0 flex-1 items-center gap-3 rounded-lg px-3 text-left transition-colors " +
    "before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[3px] before:rounded-full before:bg-primary before:opacity-0 before:transition-opacity " +
    "data-[selected=true]:bg-primary/10 data-[selected=true]:before:opacity-100";

  return (
    <div
      className="group flex items-center gap-1 px-2"
      style={{ height: ROW_HEIGHT }}
    >
      {onOpen ? (
        <button
          type="button"
          data-selected={selected}
          aria-current={selected ? "true" : undefined}
          onClick={() => onOpen(task.id)}
          title={t("archive.openTask")}
          className={`${mainClass} cursor-pointer hover:bg-muted data-[selected=true]:hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
        >
          {content}
        </button>
      ) : (
        <div data-selected={selected} className={mainClass}>
          {content}
        </div>
      )}

      {/* Always visible (touch friendly), stronger on hover/focus. */}
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => onRestore(task.id)}
        aria-label={t("archive.restoreLabel", { title: task.title })}
        title={t("archive.restore")}
        className="shrink-0 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:opacity-100"
      >
        <RotateCcw className="size-4" aria-hidden="true" />
      </Button>
    </div>
  );
}

// Group header + premium separator (fading line under the label).
function GroupHeader({ label, count }: { label: string; count: number }) {
  return (
    <h3
      className="relative flex items-end gap-1.5 px-5 pb-2 text-xs font-medium text-muted-foreground first-letter:uppercase"
      style={{ height: HEADER_HEIGHT }}
    >
      {label}
      <span className="font-normal tabular-nums">{count}</span>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-4 bottom-0 h-px bg-gradient-to-r from-transparent via-border to-transparent"
      />
    </h3>
  );
}

/**
 * Archive panel (right side Sheet).
 *
 * 1. static zone — title, search, period chips (unchanged);
 * 2. dynamic zone — premium bordered frame containing the archived tasks
 *    grouped by date, each group introduced by a premium separator.
 *
 * Daily-use shortcuts:
 * - "/" focuses the search, Enter opens the first result;
 * - Esc clears the search first, then closes the panel;
 * - filters reset every time the panel opens.
 */
export function ArchiveSheet({
  open,
  onOpenChange,
  projectName,
  tasks,
  onRestore,
  onOpenTask,
  closeOnOpen = true,
  selectedTaskId,
}: Props) {
  const { t, i18n } = useTranslation();
  const [q, setQ] = useState("");
  const [period, setPeriod] = useState<Period>("all");
  const scrollRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Fresh start on every opening: a leftover filter is the #1 daily annoyance.
  useEffect(() => {
    if (open) {
      setQ("");
      setPeriod("all");
    }
  }, [open]);

  const query = q.trim().toLowerCase();

  const handleOpenTask = onOpenTask
    ? (taskId: string) => {
        onOpenTask(taskId);
        if (closeOnOpen) onOpenChange(false);
      }
    : undefined;

  // Counts shown on the chips (they follow the current search).
  const counts = useMemo(() => {
    const base = tasks.filter(
      (task) => !query || task.title.toLowerCase().includes(query),
    );
    return Object.fromEntries(
      PERIOD_OPTIONS.map((o) => [
        o.value,
        base.filter((task) => matchPeriod(task, o.value)).length,
      ]),
    ) as Record<Period, number>;
  }, [tasks, query]);

  // Search + period filter, newest first.
  const filtered = useMemo(
    () =>
      tasks
        .filter(
          (task) =>
            (!query || task.title.toLowerCase().includes(query)) &&
            matchPeriod(task, period),
        )
        .sort(
          (a, b) =>
            new Date(b.archivedAt).getTime() - new Date(a.archivedAt).getTime(),
        ),
    [tasks, query, period],
  );

  // Flat list [header, task, task, header, task...] so one renderer
  // (and one virtualizer) handles everything.
  const items = useMemo<Item[]>(() => {
    const todayStart = startOfDay(new Date());
    const groups: {
      key: string;
      kind: GroupKind;
      label: string;
      tasks: ArchivedTaskSummary[];
    }[] = [];

    for (const task of filtered) {
      const date = new Date(task.archivedAt);
      const { key, kind } = groupOf(date, todayStart);
      let group = groups.find((g) => g.key === key);
      if (!group) {
        const label =
          kind === "today"
            ? t("archive.group.today")
            : kind === "yesterday"
              ? t("archive.group.yesterday")
              : kind === "week"
                ? t("archive.group.last7Days")
                : date.toLocaleDateString(i18n.language, {
                    month: "long",
                    year: "numeric",
                  });
        group = { key, kind, label, tasks: [] };
        groups.push(group);
      }
      group.tasks.push(task);
    }

    return groups.flatMap((g) => [
      {
        type: "header" as const,
        key: `h-${g.key}`,
        label: g.label,
        count: g.tasks.length,
      },
      ...g.tasks.map((task) => ({
        type: "task" as const,
        key: task.id,
        task,
        meta: formatMeta(new Date(task.archivedAt), g.kind, i18n.language),
      })),
    ]);
  }, [filtered, t, i18n.language]);

  const shouldVirtualize = items.length > VIRTUALIZE_ABOVE;
  const virtualizer = useVirtualizer({
    count: shouldVirtualize ? items.length : 0,
    getScrollElement: () => scrollRef.current,
    estimateSize: (i) =>
      items[i]?.type === "header" ? HEADER_HEIGHT : ROW_HEIGHT,
    getItemKey: (i) => items[i]?.key ?? i,
    overscan: 8,
  });

  const renderItem = (item: Item) =>
    item.type === "header" ? (
      <GroupHeader label={item.label} count={item.count} />
    ) : (
      <ArchiveRow
        task={item.task}
        meta={item.meta}
        query={query}
        selected={item.task.id === selectedTaskId}
        onOpen={handleOpenTask}
        onRestore={onRestore}
      />
    );

  const updateQuery = (value: string) => {
    setQ(value);
    scrollRef.current?.scrollTo({ top: 0 });
  };
  const updatePeriod = (value: Period) => {
    setPeriod(value);
    scrollRef.current?.scrollTo({ top: 0 });
  };
  const resetFilters = () => {
    updateQuery("");
    updatePeriod("all");
    searchRef.current?.focus();
  };

  const hasTasks = tasks.length > 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        aria-describedby="archive-desc"
        // Desktop: focus the search right away. Touch: don't pop the keyboard.
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          if (window.matchMedia("(pointer: fine)").matches) {
            searchRef.current?.focus();
          }
        }}
        // Esc clears the search first, then closes on the next press.
        onEscapeKeyDown={(e) => {
          if (q) {
            e.preventDefault();
            updateQuery("");
          }
        }}
        // "/" jumps to the search from anywhere in the panel,
        // except while typing in a field (input, textarea, rich-text editor).
        onKeyDown={(e) => {
          const target = e.target as HTMLElement;
          const typing =
            target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA" ||
            target.isContentEditable;
          if (e.key === "/" && !typing) {
            e.preventDefault();
            searchRef.current?.focus();
          }
        }}
        className="archive-sheet-content w-full max-w-md bg-card border-l border-border-subtle p-0 flex flex-col h-full"
      >
        <SheetDescription id="archive-desc" className="sr-only">
          {t("archive.panelDesc", { projectName: projectName ?? "" })}
        </SheetDescription>

        {/* ── Static zone (unchanged) ── */}
        <div className="flex shrink-0 flex-col gap-3 border-b border-border-subtle px-5 pb-3 pt-5">
          <SheetHeader className="flex-row items-start justify-between space-y-0 p-0">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <SheetTitle className="truncate text-sm font-semibold tracking-tight text-foreground">
                  {t("archive.title")}
                </SheetTitle>
                <span
                  aria-live="polite"
                  className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium tabular-nums text-muted-foreground"
                >
                  {filtered.length}
                </span>
              </div>
              {projectName && (
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {projectName}
                </p>
              )}
            </div>
            <SheetClose asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                aria-label={t("archive.close")}
                className="shrink-0 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="size-4" aria-hidden="true" />
              </Button>
            </SheetClose>
          </SheetHeader>

          {/* Search */}
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              ref={searchRef}
              id="archive-search"
              type="text"
              autoComplete="off"
              placeholder={t("archive.searchPlaceholder")}
              value={q}
              onChange={(e) => updateQuery(e.target.value)}
              onKeyDown={(e) => {
                // Enter = open the first result (fast path for daily use).
                if (e.key === "Enter" && handleOpenTask) {
                  const first = filtered[0];
                  if (first) handleOpenTask(first.id);
                }
              }}
              aria-label={t("archive.searchLabel")}
              className="h-9 rounded-lg border-transparent bg-muted pl-9 pr-9 text-foreground placeholder:text-muted-foreground focus:border-border-subtle"
            />
            {q ? (
              <button
                type="button"
                onClick={() => {
                  updateQuery("");
                  searchRef.current?.focus();
                }}
                aria-label={t("archive.clearSearch")}
                className="absolute right-2 top-2 grid size-5 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X className="size-3.5" aria-hidden="true" />
              </button>
            ) : (
              <kbd className="pointer-events-none absolute right-2.5 top-2.5 hidden rounded border border-border-subtle bg-background px-1.5 text-[10px] font-medium leading-4 text-muted-foreground [@media(pointer:fine)]:block">
                /
              </kbd>
            )}
          </div>

          {/* Period: one click, no dropdown. */}
          <fieldset
            aria-label={t("archive.periodLabel")}
            className="m-0 min-w-0 flex gap-1.5 border-0 p-0"
          >
            {PERIOD_OPTIONS.map((option) => {
              const active = option.value === period;
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => updatePeriod(option.value)}
                  className={`inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    active
                      ? "bg-foreground text-background"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t(option.labelKey)}
                  <span className="tabular-nums">{counts[option.value]}</span>
                </button>
              );
            })}
          </fieldset>
        </div>

        {/* ── Dynamic zone ──
            Outer wrapper = breathing room. Frame = premium border (clips the
            rounded corners). The scroll container keeps its ref, so the
            virtualizer is untouched. */}
        <div className="flex min-h-0 flex-1 flex-col p-3">
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border-subtle bg-background/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            <section
              ref={scrollRef}
              aria-label={t("archive.title")}
              className="flex-1 overflow-y-auto overscroll-contain py-1"
            >
              {items.length ? (
                shouldVirtualize ? (
                  <div
                    className="relative w-full"
                    style={{ height: virtualizer.getTotalSize() }}
                  >
                    {virtualizer.getVirtualItems().map((row) => {
                      const item = items[row.index];
                      if (!item) return null;
                      return (
                        <div
                          key={item.key}
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            transform: `translateY(${row.start}px)`,
                          }}
                        >
                          {renderItem(item)}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div>
                    {items.map((item) => (
                      <div key={item.key}>{renderItem(item)}</div>
                    ))}
                  </div>
                )
              ) : (
                // Empty states: nothing archived yet vs. nothing matches the filters.
                <div className="flex h-full min-h-[240px] flex-col items-center justify-center px-6 text-center">
                  <div className="rounded-full bg-muted p-3.5">
                    {hasTasks ? (
                      <SearchX
                        className="size-5 text-muted-foreground"
                        aria-hidden="true"
                      />
                    ) : (
                      <Archive
                        className="size-5 text-muted-foreground"
                        aria-hidden="true"
                      />
                    )}
                  </div>
                  <p className="mt-3 text-sm font-medium text-foreground">
                    {hasTasks
                      ? t("archive.noResultsTitle")
                      : t("archive.emptyTitle")}
                  </p>
                  <p className="mt-1 max-w-[240px] text-xs leading-relaxed text-muted-foreground">
                    {hasTasks
                      ? t("archive.noResultsDesc")
                      : t("archive.emptyDesc")}
                  </p>
                  {hasTasks && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={resetFilters}
                      className="mt-3 text-xs"
                    >
                      {t("archive.resetFilters")}
                    </Button>
                  )}
                </div>
              )}
            </section>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
