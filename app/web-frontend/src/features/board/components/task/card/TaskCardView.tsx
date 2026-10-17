import { useDndContext } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { TaskCardExtendedProps as ExtendedTaskCardProps } from "@packages/shared/types/components";
import {
  PRIORITY_GLOW,
  type PriorityLabel,
  priorityStyles,
} from "@packages/shared/types/task/priority-level";
import { CalendarDays, Trash } from "lucide-react";
import { type KeyboardEvent, memo, useCallback } from "react";
import i18n from "@/src/features/i18n";
import { Button } from "@/src/layout/components/ui/button";
import { cn } from "@/src/shared/utils/utils";
import { PriorityIcon } from "./priority";
import { useTaskCardActions } from "./useTaskCardActions";

function TaskCardMeta({
  task,
  priorityKey,
}: {
  task: ExtendedTaskCardProps["task"];
  priorityKey: PriorityLabel;
}) {
  const currentStyle = priorityStyles[priorityKey];

  if (priorityKey === "none" && !task.dueDate) return null;

  return (
    <div className="flex items-center gap-1.5 pt-1">
      {priorityKey !== "none" && (
        <div title={currentStyle.label}>
          <PriorityIcon priority={priorityKey} className="size-3.5" />
        </div>
      )}
      {task.dueDate && (
        <span className="inline-flex items-center gap-1 rounded-full border border-border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
          <CalendarDays className="size-3 text-teal-600 dark:text-teal-400" />
          {new Date(task.dueDate).toLocaleDateString(i18n.language || "en", {
            day: "numeric",
            month: "short",
          })}
        </span>
      )}
    </div>
  );
}

function overlayProps<T>(
  isOverlay: boolean,
  setNodeRef: (node: T | null) => void,
  attributes: object,
  listeners: object | undefined,
): {
  ref: ((node: T | null) => void) | undefined;
  spread: object;
} {
  return {
    ref: isOverlay ? undefined : setNodeRef,
    spread: isOverlay ? {} : { ...attributes, ...listeners },
  };
}
function cardClassName(
  isOver: boolean,
  isSelected: boolean,
  isOverlay: boolean,
  glowClass: string,
): string {
  return cn(
    "task-card group/card relative w-full rounded-xl px-3.5 pt-4 pb-3.5 select-none outline-none",
    // Pas de transition-all sur transform (conflit dnd) — seulement couleurs/ombre
    "transition-[background-color,border-color,box-shadow] duration-[400ms] ease-spring will-change-transform",
    isOver &&
      "ring-1 ring-primary/20 bg-primary/[0.03] shadow-[0_4px_12px_rgba(94,106,210,0.10)] scale-[1.01]",
    // Apple: 400ms spring, no jump — shadow breathes, border stays calm
    "transition-all duration-[400ms] ease-spring will-change-transform",
    "bg-card dark:bg-popover border border-border-subtle dark:border-border-subtle shadow-[0_1px_3px_0_rgba(17,19,24,0.10),0_4px_16px_0_rgba(17,19,24,0.10),0_0_0_1px_rgba(17,19,24,0.06)] dark:shadow-[0_2px_8px_0_rgba(0,0,0,0.5),0_8px_24px_0_rgba(0,0,0,0.45)]",
    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card",
    glowClass,
    isSelected &&
      "border-primary dark:border-primary shadow-[0_0_0_2px_rgba(94,106,210,0.20),0_4px_16px_0_rgba(94,106,210,0.12)] dark:shadow-[0_0_0_2px_rgba(94,106,210,0.30),0_4px_16px_0_rgba(0,0,0,0.5)]",
    isOverlay
      ? "cursor-grabbing rotate-3 scale-[1.02] shadow-[0_20px_40px_-12px_rgba(0,0,0,0.25),0_0_0_1px_rgba(0,0,0,0.07)] dark:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.08)]"
      : "cursor-pointer active:scale-[0.985] active:duration-150",
    !isOverlay &&
      "hover:shadow-[0_2px_8px_0_rgba(17,19,24,0.04),0_12px_32px_0_rgba(17,19,24,0.07),0_0_0_1px_rgba(17,19,24,0.04)] dark:hover:shadow-[0_2px_8px_0_rgba(0,0,0,0.4),0_12px_32px_0_rgba(0,0,0,0.35)]",
  );
}

const TaskCardView = memo(function TaskCardView({
  task,
  onDelete,
  onOpenDetail,
  isSelected = false,
  isOverlay = false,
  activeTaskId = null,
}: ExtendedTaskCardProps) {
  const { handleCardClick, handleDelete, onPointerDownCapture } =
    useTaskCardActions({
      task,
      onDelete,
      onOpenDetail,
    });
  const { over } = useDndContext();
  const isOver = !isOverlay && over?.id === task.id;
  const { attributes, listeners, setNodeRef, transform } = useSortable({
    id: task.id,
    data: { type: "task", task },
  });

  const isDragging = task.id === activeTaskId;

  const style: React.CSSProperties = isOverlay
    ? {
        cursor: "grabbing",
        boxShadow:
          "0 25px 50px -12px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08)",
      }
    : {
        transform: CSS.Transform.toString(transform) || undefined,
        // Transform géré par dnd-kit, pas par Tailwind transition-all
        transition: transform
          ? "transform 200ms cubic-bezier(0.25,0.1,0.25,1)"
          : undefined,
        opacity: isDragging ? 0 : 1,
        pointerEvents: isDragging ? "none" : "auto",
      };

  const priorityKey: PriorityLabel = task.priority || "none";
  const glowClass = PRIORITY_GLOW[priorityKey];
  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (isOverlay) return;
      if (
        event.key === "Enter" ||
        event.key === " " ||
        event.key === "Spacebar"
      ) {
        event.preventDefault();
        handleCardClick();
      }
    },
    [isOverlay, handleCardClick],
  );

  const overlay = overlayProps(isOverlay, setNodeRef, attributes, listeners);

  return (
    // biome-ignore lint/a11y/useSemanticElements: drag-and-drop requires div with role="button"
    <div
      ref={overlay.ref}
      style={style}
      data-task-card={!isOverlay}
      data-task-card-overlay={isOverlay}
      {...overlay.spread}
      onPointerDownCapture={onPointerDownCapture}
      onKeyDown={handleKeyDown}
      onClick={handleCardClick}
      role="button"
      tabIndex={isOverlay ? -1 : 0}
      aria-dropeffect={isOver ? "move" : undefined}
      className={cardClassName(isOver, isSelected, isOverlay, glowClass)}
    >
      {isOver && (
        <div
          className="absolute -top-1.5 left-3 right-3 h-0.5 bg-primary rounded-full shadow-[0_1px_4px_rgba(94,106,210,0.4)] pointer-events-none"
          aria-hidden
        />
      )}
      <div className="flex items-start gap-2">
        <h3 className="text-sm font-semibold tracking-tight text-foreground transition-colors duration-[300ms] ease-spring line-clamp-2 leading-snug flex-1 min-w-0 cursor-grab">
          {task.title || "Untitled"}
        </h3>
        {!isOverlay && (
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={handleDelete}
            onPointerDown={(e) => e.stopPropagation()}
            className="shrink-0 text-text-muted-hard hover:text-red-400 transition-all duration-[300ms] ease-spring rounded-md w-5 h-5 opacity-0 group-hover/card:opacity-100 focus-visible:opacity-100"
            aria-label="Supprimer la tâche"
          >
            <Trash width={10} height={10} strokeWidth={2} />
          </Button>
        )}
      </div>
      <TaskCardMeta task={task} priorityKey={priorityKey} />
    </div>
  );
});

export default TaskCardView;
