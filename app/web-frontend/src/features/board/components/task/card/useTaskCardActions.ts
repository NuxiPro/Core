import type { UseTaskCardActionsParams } from "@packages/shared/types/components";
import { type MouseEvent, useCallback } from "react";

// The MouseSensor's movement threshold keeps clicks separate from drags.
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
      onDelete(task.id);
    },
    [onDelete, task.id],
  );

  return {
    handleCardClick,
    handleDelete,
  };
}
