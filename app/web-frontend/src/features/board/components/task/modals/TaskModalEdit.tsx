import { COLUMNS } from "@packages/shared/config";
import type { TaskModalEditProps } from "@packages/shared/types/components";
import type { PriorityLabel } from "@packages/shared/types/task/priority-level";
import type { Task } from "@packages/shared/types/task/task";
import { FileText } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { DatePicker } from "@/src/layout/components/ui/date-picker";
import { DialogTitle } from "@/src/layout/components/ui/dialog";
import { Separator } from "@/src/layout/components/ui/separator";
import { CONTENT_MAX, TITLE_MAX } from "@/src/shared/lib/constants";
import { sanitizeHtml } from "@/src/shared/utils/sanitize";

import { PrioritySelect } from "../card/priority";
import type { EditorHandle } from "../editor";
import { TipTapEditor } from "../editor";
import { useTaskForm } from "../hooks/useTaskForm";
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

  // Two-phase description: clean read view, editor only on click.
  const [editing, setEditing] = useState(false);
  const editorRef = useRef<EditorHandle | null>(null);
  useEffect(() => {
    if (editing) editorRef.current?.focus();
  }, [editing]);

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

  return (
    <TaskDialogShell
      open={!!task}
      onOpenChange={(o) => !o && handleClose()}
      maxW="max-w-[640px] sm:max-w-[720px]"
      badge={badge}
      closeLabel={t("task.close")}
      className="flex flex-col max-h-[85vh]"
    >
      <DialogTitle className="sr-only">
        {title || t("task.taskDetails")}
      </DialogTitle>

      <div className="flex-1 flex min-h-0 flex-col overflow-y-auto">
        <div className="px-5 pt-4">
          <label htmlFor="edit-task-title" className="sr-only">
            {t("task.titlePlaceholder")}
          </label>
          <input
            id="edit-task-title"
            value={title}
            onChange={(e) => setTitle(e.target.value.slice(0, TITLE_MAX))}
            placeholder={t("task.titlePlaceholder")}
            className="w-full bg-background border border-border rounded-xl px-3.5 py-3 text-[15px] font-medium leading-5 text-foreground placeholder:text-text-muted-hard outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300 ease-spring"
          />
          <div className="mt-1.5 flex items-center justify-between">
            {title.length > TITLE_MAX - 40 && (
              <span
                className={`text-xs font-mono tabular-nums ${title.length >= TITLE_MAX ? "text-destructive" : title.length > TITLE_MAX - 20 ? "text-amber-600" : "text-muted-foreground"}`}
              >
                {title.length}/{TITLE_MAX}
              </span>
            )}
          </div>
        </div>

        <div className="px-5 pt-2.5 flex flex-wrap items-center gap-1.5">
          <PrioritySelect
            value={priority}
            onValueChange={setPriority}
            compact
          />
          <DatePicker
            date={dueDate ? new Date(dueDate) : undefined}
            onSelect={(d) => setDueDate(toUTCNoonISO(d))}
            placeholder={t("task.selectDate")}
            triggerClassName="h-8 w-auto text-[13px] rounded-xl"
          />
        </div>

        <div className="flex-1 min-h-0 px-5 pt-3 flex flex-col">
          <div className="flex items-center gap-2 text-base font-medium text-foreground">
            <FileText
              className="h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
            {t("task.descriptionName")}
          </div>
          <Separator className="my-1.5 opacity-50" />
          {editing ? (
            <fieldset
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                  setEditing(false);
                }
              }}
              className="flex flex-col rounded-xl border border-border bg-card overflow-hidden focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10 transition-all duration-300"
            >
              <TipTapEditor
                ref={editorRef}
                value={description}
                onChange={(v) =>
                  setDescription(sanitizeHtml(v).slice(0, CONTENT_MAX))
                }
                className="min-h-[200px] max-h-[50vh] overflow-y-auto [&_.ProseMirror]:p-3 [&_.ProseMirror]:min-h-[200px]"
              />
            </fieldset>
          ) : (
            <button
              type="button"
              onClick={() => setEditing(true)}
              aria-label={t("task.editDescription")}
              className="min-h-[120px] max-h-[40vh] overflow-y-auto w-full rounded-xl px-3 py-2 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {description.trim() ? (
                <span
                  className="tiptap block whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(description) }}
                />
              ) : (
                <span className="text-sm font-medium text-foreground">
                  {t("task.descriptionPlaceholder")}
                </span>
              )}
            </button>
          )}
          <div className="border-t border-border my-2" />
          <div className="flex items-center justify-between py-2">
            <span className="text-xs text-muted-foreground">
              {editing ? t("task.descriptionHint") : t("task.clickToEditHint")}
            </span>
            {editing && description.length > CONTENT_MAX - 200 && (
              <span className="text-xs font-mono tabular-nums text-muted-foreground">
                {description.length}/{CONTENT_MAX}
              </span>
            )}
          </div>
          {error && (
            <div className="mb-2 p-2.5 bg-destructive/10 border border-destructive/20 rounded-xl">
              <p className="text-xs font-medium text-destructive" role="alert">
                {error}
              </p>
            </div>
          )}
        </div>
      </div>
    </TaskDialogShell>
  );
}
