import type { UseTaskCardActionsParams } from "@packages/shared/types/components";
import { type MouseEvent, useCallback } from "react";

// Le sensor MouseSensor (distance: 8) garantit qu'un clic simple ne
// déclenche jamais le drag — plus besoin de workaround géométrique ici
// (l'ancien seuil DRAG_CLICK_THRESHOLD est supprimé).
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

      // Anti-spam: clics répétés pendant l'animation = un seul delete.
      if (card.classList.contains("task-card--deleting")) return;
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
