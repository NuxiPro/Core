import type { UseTaskCardActionsParams } from "@packages/shared/types/components";
import { type MouseEvent, type PointerEvent, useCallback, useRef } from "react";

// Seuil aligné sur le PointerSensor dnd-kit (distance: 6) : en dessous,
// c'est un clic ; au-dessus, c'était un drag — le clic d'après-drag est ignoré.
const DRAG_CLICK_THRESHOLD = 6;

export function useTaskCardActions({
  task,
  onDelete,
  onOpenDetail,
}: UseTaskCardActionsParams) {
  const downPos = useRef<{ x: number; y: number } | null>(null);

  const onPointerDownCapture = useCallback((e: PointerEvent) => {
    downPos.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleCardClick = useCallback(
    (e?: MouseEvent) => {
      const down = downPos.current;
      downPos.current = null;
      if (down && e) {
        const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
        if (moved > DRAG_CLICK_THRESHOLD) return;
      }
      onOpenDetail?.(task.id);
    },
    [onOpenDetail, task.id],
  );

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
    onPointerDownCapture,
  };
}
