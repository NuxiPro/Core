import { COLUMNS } from "@packages/shared/config";
import type { TaskModalEditProps } from "@packages/shared/types/components";
import type { PriorityLabel } from "@packages/shared/types/task/priority-level";
import type { Task } from "@packages/shared/types/task/task";
import { History } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { DatePicker } from "@/src/layout/components/ui/date-picker";
import { DialogTitle } from "@/src/layout/components/ui/dialog";
import { CONTENT_MAX, TITLE_MAX } from "@/src/shared/lib/constants";
import { sanitizeHtml } from "@/src/shared/utils/sanitize";
import { PrioritySelect } from "../card/priority";
import { TipTapEditor } from "../editor";
import { useTaskForm } from "../hooks/useTaskForm";
import { MetadataSection } from "../sections/MetadataSection";
import { TaskDialogShell } from "./TaskDialogShell";

// Due dates are day-precision: noon UTC survives ±12h timezones without day-shift.
const toUTCNoonISO = (d: Date | undefined): string | null => {
  if (!d) return null;
  return new Date(
    Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 12),
  ).toISOString();
};

export function TaskModalEdit({ task, onClose, onUpdate }: TaskModalEditProps) {
  const { t } = useTranslation();
  const [showActivity, setShowActivity] = useState(false);
  const handleUpdate = onUpdate
    ? (
        id: Task["id"],
        u: {
          title: string;
          description: string;
          priority?: PriorityLabel;
          dueDate?: string | null;
        },
      ) =>
        onUpdate(id, {
          ...u,
          description: sanitizeHtml(u.description),
        }) as Promise<void>
    : undefined;
  const {
    title,
    setTitle,
    description,
    setDescription,
    priority,
    setPriority,
    dueDate,
    setDueDate,
    handleSave,
    error,
  } = useTaskForm(task, handleUpdate);

  const handleClose = useCallback(async () => {
    await handleSave();
    onClose();
  }, [handleSave, onClose]);
  const colTitle = task ? (COLUMNS[task.colId]?.title ?? task.colId) : "";

  useEffect(() => {
    if (!task) return;
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        handleClose();
      }
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [task, handleClose]);

  const badge = (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-primary/10 text-primary rounded-full px-2.5 py-1">
      <span className="size-1.5 rounded-full bg-primary" aria-hidden />
      {colTitle}
    </span>
  );

  const extraActions = (
    <button
      type="button"
      onClick={() => setShowActivity(!showActivity)}
      className={`size-7 inline-flex items-center justify-center rounded-md border transition-colors ${showActivity ? "bg-primary border-primary text-white" : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted"}`}
      aria-label={t("task.activity")}
      aria-pressed={showActivity}
    >
      <History width={14} height={14} />
    </button>
  );

  return (
    <TaskDialogShell
      open={!!task}
      onOpenChange={(o) => !o && handleClose()}
      maxW="max-w-[640px] sm:max-w-[720px]"
      badge={badge}
      extraActions={extraActions}
      closeLabel={t("task.close")}
      className="h-[68vh] max-h-[640px] flex flex-col"
    >
      <DialogTitle className="sr-only">
        {title || t("task.taskDetails")}
      </DialogTitle>

      <div className="flex-1 flex min-h-0 flex-col sm:flex-row">
        <div className="flex-1 flex flex-col min-h-0 min-w-0">
          <div className="px-5 pt-4">
            <label htmlFor="edit-task-title" className="sr-only">
              {t("task.titlePlaceholder")}
            </label>
            <input
              id="edit-task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, TITLE_MAX))}
              placeholder={t("task.titlePlaceholder")}
              className="w-full bg-background border border-border rounded-xl px-3.5 py-3 text-[15px] font-medium leading-5 text-foreground placeholder:text-text-muted-hard outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]"
            />
            <div className="mt-1.5 flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground">
                <kbd className="px-1 py-0.5 text-[11px] font-mono bg-card border border-border-subtle rounded shadow-sm">
                  ⌘
                </kbd>
                <span className="mx-1">+</span>
                <kbd className="px-1 py-0.5 text-[11px] font-mono bg-card border border-border-subtle rounded shadow-sm">
                  Entrée
                </kbd>
                <span className="ml-1.5">{t("task.saveHint")}</span>
              </span>
              {title.length > TITLE_MAX - 40 && (
                <span
                  className={`text-xs font-mono tabular-nums ${title.length >= TITLE_MAX ? "text-destructive" : title.length > TITLE_MAX - 20 ? "text-amber-600" : "text-muted-foreground"}`}
                >
                  {title.length}/{TITLE_MAX}
                </span>
              )}
            </div>
          </div>

          <div className="flex-1 min-h-0 px-5 pt-3 flex flex-col">
            <div className="flex-1 min-h-0 flex flex-col rounded-xl border border-border bg-card overflow-hidden focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10 transition-all duration-300">
              <TipTapEditor
                value={description}
                onChange={(v) =>
                  setDescription(sanitizeHtml(v).slice(0, CONTENT_MAX))
                }
                className="flex-1 min-h-[220px] [&_.ProseMirror]:p-3 [&_.ProseMirror]:min-h-[200px]"
              />
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-xs text-muted-foreground">
                {t("task.descriptionHint")}
              </span>
              {description.length > CONTENT_MAX - 200 && (
                <span className="text-xs font-mono tabular-nums text-muted-foreground">
                  {description.length}/{CONTENT_MAX}
                </span>
              )}
            </div>
            {error && (
              <div className="mb-2 p-2.5 bg-destructive/10 border border-destructive/20 rounded-xl">
                <p
                  className="text-xs font-medium text-destructive"
                  role="alert"
                >
                  {error}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="hidden sm:flex w-[220px] flex-col border-l border-border bg-background shrink-0">
          <div className="p-4 space-y-4 overflow-y-auto">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.08em]">
                  {t("metadata.priority")}
                </span>
                <span className="text-[10px] font-mono text-muted-foreground/50 border border-border rounded px-1">
                  P
                </span>
              </div>
              <div className="mt-2">
                <PrioritySelect value={priority} onValueChange={setPriority} />
              </div>
              <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
                {t("task.quickPriorityHint")}
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.08em]">
                  {t("metadata.dueDate")}
                </span>
                <span className="text-[10px] font-mono text-muted-foreground/50 border border-border rounded px-1">
                  D
                </span>
              </div>
              <div className="mt-2 [&_button]:w-full">
                <DatePicker
                  date={dueDate ? new Date(dueDate) : undefined}
                  onSelect={(d) => setDueDate(toUTCNoonISO(d))}
                  placeholder={t("task.selectDate")}
                />
              </div>
            </div>

            <div className="h-px bg-border" />

            <div className="rounded-xl bg-card border border-border p-3">
              <p className="text-xs font-medium text-foreground">
                {t("task.shortcuts")}
              </p>
              <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground">
                <li className="flex items-center justify-between">
                  <span>{t("task.saveShortcut")}</span>
                  <span className="font-mono text-[11px] border border-border rounded px-1 bg-background">
                    ⌘↵
                  </span>
                </li>
                <li className="flex items-center justify-between">
                  <span>{t("task.closeShortcut")}</span>
                  <span className="font-mono text-[11px] border border-border rounded px-1 bg-background">
                    Esc
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {showActivity && (
        <div className="h-[140px] border-t border-border overflow-y-auto bg-background">
          <MetadataSection task={task} />
        </div>
      )}
    </TaskDialogShell>
  );
}
