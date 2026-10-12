import type { UseTaskCardActionsParams } from "@packages/shared/types/components";
import { type MouseEvent, useCallback } from "react";

export function useTaskCardActions({
  task,
  onDelete,
  onOpenDetail,
}: UseTaskCardActionsParams) {
  const handleCardClick = useCallback(() => {
    onOpenDetail?.(task.id);
  }, [onOpenDetail, task.id]);

  const handleDelete = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      const card = event.currentTarget.closest(
        "[data-task-card]",
      ) as HTMLElement | null;

      if (!card) {
        onDelete(task.id);
        return;
      }

      card.classList.add("task-card--deleting");
      card.addEventListener("animationend", () => onDelete(task.id), {
        once: true,
      });
    },
    [onDelete, task.id],
  );

  return {
    handleCardClick,
    handleDelete,
  };
}
