import type { TaskModalEditProps } from "@packages/shared/types/components";
import type { PriorityLabel } from "@packages/shared/types/task/priority-level";
import type {
  ArchivedTask,
  ArchivedTaskSummary,
  Task,
  TaskSummary,
} from "@packages/shared/types/task/task";
import { Archive, FileText, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader } from "@/src/layout/components/animation/loading/Loader";
import { DatePicker } from "@/src/layout/components/ui/date-picker";
import { DialogTitle } from "@/src/layout/components/ui/dialog";
import { CONTENT_MAX, TITLE_MAX } from "@/src/shared/lib/constants";
import { sanitizeHtml } from "@/src/shared/utils/sanitize";
import { PrioritySelect } from "../board/components/task/card/priority";
import { useTaskForm } from "../board/components/task/hooks/useTaskForm";
import { LazyTipTapEditorWithSuspense } from "../board/components/task/md-editor/lazy-tiptap-editor";
import { TaskDialogShell } from "../board/components/task/modals/TaskDialogShell";

// Same as TaskModalEdit, plus the archive types: the panel opens from
// the light list summary while the full detail is still loading.
type Props = Omit<TaskModalEditProps, "task"> & {
  task: Task | TaskSummary | ArchivedTask | ArchivedTaskSummary | null;
  /** Permanently delete this archived task (dedicated endpoint). */
  onDelete?: ((id: string) => Promise<void> | void) | undefined;
};

// Due dates are day-precision: noon UTC survives ±12h timezones without day-shift.
const toUTCNoonISO = (d: Date | undefined): string | null => {
  if (!d) return null;
  return new Date(
    Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 12),
  ).toISOString();
};

function DescriptionField({
  description,
  setDescription,
}: {
  description: string;
  setDescription: (v: string) => void;
}) {
  const { t } = useTranslation();
  const showCounter = description.length > CONTENT_MAX - 200;

  return (
    <div className="flex-1 min-h-0 px-5 pt-3 pb-4 flex flex-col gap-1.5">
      <div className="flex h-8 items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <FileText
            className="h-4 w-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          {t("task.descriptionName")}
        </div>
        {showCounter && (
          <span className="text-xs font-mono tabular-nums text-muted-foreground">
            {description.length}/{CONTENT_MAX}
          </span>
        )}
      </div>
      {/* min-w-0 lets the fieldset shrink below its content width —
          the browser default (min-inline-size: min-content) would keep
          it as wide as the toolbar and force an horizontal scrollbar
          on the dialog. Aligned with the title input (no ml-6). */}
      <fieldset className="min-w-0 flex flex-col rounded-lg border border-border bg-card focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10 transition-all duration-300">
        <LazyTipTapEditorWithSuspense
          value={description}
          onChange={(v) =>
            setDescription(sanitizeHtml(v).slice(0, CONTENT_MAX))
          }
        />
      </fieldset>
    </div>
  );
}

/**
 * Task popup opened from the archive panel.
 *
 * Difference with the kanban TaskModalEdit:
 * - closing (X, Esc, "Cancel") NEVER saves;
 * - saving only happens on the "Save" button (or the Enter key alone);
 * - the delete button is two-step (arm, then confirm) — it removes the
 *   archived row for good.
 * That removes every accidental modification.
 */
export function ArchiveTaskDialog({
  task,
  onClose,
  onUpdate,
  onDelete,
}: Props) {
  const { t } = useTranslation();
  const [saving, setSaving] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  // The list summary is title-only: feeding it to the form would seed
  // empty fields that never refresh, because the form only re-syncs when
  // the task id changes — and the id stays the same when the detail
  // arrives. So the form only ever gets the full detail: it syncs at
  // that moment (null -> id).
  const formTask = task && "description" in task ? task : null;

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
  } = useTaskForm(formTask, handleUpdate);

  // Explicit save, then close.
  const handleSaveAndClose = useCallback(async () => {
    if (saving) return;
    setSaving(true);
    try {
      await handleSave();
      onClose();
    } finally {
      setSaving(false);
    }
  }, [saving, handleSave, onClose]);

  // First click only arms the button, the second one really deletes:
  // a single clear action, no modal to confirm it.
  const handleDelete = useCallback(async () => {
    if (!onDelete || !task || deleting) return;
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      return;
    }
    setDeleting(true);
    try {
      await onDelete(task.id);
      // The parent closes the dialog and refreshes the list.
    } catch {
      // deleteArchivedTask already logged the error — reset the button
      // so the user can retry, and swallow the rejection.
      setConfirmingDelete(false);
    } finally {
      setDeleting(false);
    }
  }, [onDelete, task, deleting, confirmingDelete]);

  // Enter alone = Save (no Ctrl/Cmd needed). Keys that already mean
  // something else are left alone: Enter in the editor inserts a line,
  // Enter on a button or in a dropdown does its own job.
  useEffect(() => {
    if (!task) return;
    const h = (e: KeyboardEvent) => {
      if (e.key !== "Enter") return;
      if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return;
      const el = e.target as HTMLElement | null;
      if (!el) return;
      const typing =
        el.tagName === "TEXTAREA" ||
        el.tagName === "SELECT" ||
        el.tagName === "BUTTON" ||
        el.isContentEditable ||
        [
          "button",
          "menuitem",
          "option",
          "checkbox",
          "radio",
          "switch",
        ].includes(el.getAttribute("role") ?? "");
      if (typing) return;
      e.preventDefault();
      handleSaveAndClose();
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [task, handleSaveAndClose]);

  const badge = (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-muted text-muted-foreground rounded-full px-2.5 py-1">
      <Archive className="size-3" aria-hidden="true" />
      {t("archive.title")}
    </span>
  );

  // Summary received, detail still loading: zero action available.
  // Discriminant: the full detail always exposes `description`.
  if (task && !("description" in task)) {
    return (
      <TaskDialogShell
        open
        onOpenChange={(o) => !o && onClose()}
        maxW="max-w-[480px]"
        badge={badge}
        closeLabel={t("task.close")}
        className="flex flex-col max-h-[85vh]"
      >
        <DialogTitle className="sr-only">{task.title}</DialogTitle>
        {/* Grace delay: if the detail arrives fast, this block vanishes
            before being visible — no loading flash. */}
        <div className="px-5 py-8 flex flex-col items-center gap-3 animate-[fadeIn_0.3s_ease_0.2s_both]">
          <p className="text-[15px] font-medium text-foreground text-center">
            {task.title}
          </p>
          <Loader />
        </div>
      </TaskDialogShell>
    );
  }

  return (
    <TaskDialogShell
      open={!!task}
      // Closing = cancel. Nothing is saved here.
      onOpenChange={(o) => !o && onClose()}
      maxW="max-w-[480px] sm:max-w-[560px]"
      badge={badge}
      closeLabel={t("task.close")}
      className="flex flex-col max-h-[85vh]"
    >
      <DialogTitle className="sr-only">
        {title || t("task.taskDetails")}
      </DialogTitle>

      {/* overflow-x-hidden: a stray horizontal overflow (toolbar, long
          word) is clipped instead of showing a useless scrollbar. */}
      <div className="flex-1 flex min-h-0 flex-col overflow-y-auto overflow-x-hidden">
        <div className="px-5 pt-4">
          <label htmlFor="archive-task-title" className="sr-only">
            {t("task.titlePlaceholder")}
          </label>
          <input
            id="archive-task-title"
            value={title}
            onChange={(e) => setTitle(e.target.value.slice(0, TITLE_MAX))}
            placeholder={t("task.titlePlaceholder")}
            className="w-full bg-background border border-border rounded-xl px-3.5 py-3 text-[15px] font-medium leading-5 text-foreground placeholder:text-text-muted-hard outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300 ease-spring"
          />
          {/* Only rendered near the limit: an always-empty row here
              would just push everything down for nothing. */}
          {title.length > TITLE_MAX - 40 && (
            <div className="mt-1.5 flex items-center justify-between">
              <span
                className={`text-xs font-mono tabular-nums ${title.length >= TITLE_MAX ? "text-destructive" : title.length > TITLE_MAX - 20 ? "text-amber-600 dark:text-destructive/70" : "text-muted-foreground"}`}
              >
                {title.length}/{TITLE_MAX}
              </span>
            </div>
          )}
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

        <DescriptionField
          description={description}
          setDescription={setDescription}
        />
        {error && (
          <div className="mx-5 mb-4 p-2.5 bg-destructive/10 border border-destructive/20 rounded-xl">
            <p className="text-xs font-medium text-destructive" role="alert">
              {error}
            </p>
          </div>
        )}
      </div>

      {/* Footer: delete on its own side, save actions on the other.
          The save-hint chip is gone: it showed a hardcoded "⌘↵" while
          the shortcut is plain Enter now. */}
      <div className="flex shrink-0 items-center justify-between gap-3 border-t border-border bg-background/60 px-5 py-3">
        <button
          type="button"
          onClick={handleDelete}
          disabled={!onDelete || deleting}
          className={`inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
            confirmingDelete
              ? "bg-destructive/15 text-destructive ring-1 ring-destructive/40 hover:bg-destructive/20"
              : "text-destructive hover:bg-destructive/10"
          }`}
        >
          <Trash2 className="size-3.5" aria-hidden="true" />
          {confirmingDelete
            ? t("archive.deleteConfirm")
            : t("archive.deleteTask")}
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 items-center justify-center rounded-full px-3.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {t("task.cancel")}
          </button>
          <button
            type="button"
            onClick={handleSaveAndClose}
            disabled={saving || deleting || !title.trim()}
            className="inline-flex h-8 items-center justify-center rounded-full bg-primary px-3.5 text-xs font-semibold tracking-wide text-primary-foreground shadow-sm transition-colors duration-200 hover:bg-primary-hover active:bg-primary-active disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t("task.save")}
          </button>
        </div>
      </div>
    </TaskDialogShell>
  );
}
