import type { TaskModalCreateProps } from "@packages/shared/types/components";
import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { TITLE_MAX } from "@/src/shared/lib/constants";
import { TaskDialogShell } from "./TaskDialogShell";

export function TaskModalCreate({
  colId,
  columnTitle,
  prefix,
  onAdd,
  open,
  onOpenChange,
}: TaskModalCreateProps) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: { title: "" } });
  const len = watch("title", "").length;

  const onSubmit = useCallback(
    (d: { title: string }) => {
      const title = d.title.trim().slice(0, TITLE_MAX);
      if (!title) return;
      onAdd({ title, colId });
      reset();
      onOpenChange(false);
    },
    [onAdd, colId, reset, onOpenChange],
  );

  const hasTitle = watch("title", "").trim().length > 0;

  const badge = (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-primary/10 text-primary rounded-full px-2.5 py-1">
      <span className="size-1.5 rounded-full bg-primary" aria-hidden />
      {columnTitle}
      {prefix && (
        <span className="text-muted-foreground font-mono text-[11px]">
          {prefix}
        </span>
      )}
    </span>
  );

  return (
    <TaskDialogShell
      open={open}
      onOpenChange={onOpenChange}
      maxW="max-w-[480px]"
      badge={badge}
      closeLabel={t("task.close")}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
        <div className="px-5 pt-4 pb-3">
          <label htmlFor="task-title" className="sr-only">
            {t("task.titlePlaceholder")}
          </label>
          <input
            id="task-title"
            autoFocus
            maxLength={TITLE_MAX}
            {...register("title", { required: t("task.titleRequired") })}
            placeholder={t("task.titlePlaceholder")}
            aria-invalid={!!errors.title}
            className="w-full bg-background border border-border rounded-xl px-3.5 py-3 text-[15px] font-medium leading-5 text-foreground placeholder:text-text-muted-hard outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300 ease-spring"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(onSubmit)();
              }
            }}
          />
          {errors.title && (
            <p
              className="mt-2 text-xs font-medium text-destructive"
              role="alert"
            >
              {errors.title.message}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 px-5 py-3 bg-background/60 border-t border-border">
          <div className="flex items-center gap-2 text-xs">
            <kbd className="inline-flex items-center justify-center min-w-[28px] px-1.5 py-1 text-xs font-medium font-mono bg-card border border-border-subtle rounded-md shadow-sm text-foreground">
              ↵
            </kbd>
            <span className="text-muted-foreground font-medium">
              {t("task.createHint")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {len > 0 && (
              <span
                className={`text-xs font-mono tabular-nums ${len > TITLE_MAX - 20 ? "text-amber-600" : "text-muted-foreground"}`}
              >
                {len}/{TITLE_MAX}
              </span>
            )}
            <button
              type="submit"
              disabled={!hasTitle}
              className="inline-flex items-center justify-center h-8 px-3.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold tracking-wide hover:bg-primary-hover active:bg-primary-active disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-200 shadow-sm"
            >
              Créer
            </button>
          </div>
        </div>
      </form>
    </TaskDialogShell>
  );
}
