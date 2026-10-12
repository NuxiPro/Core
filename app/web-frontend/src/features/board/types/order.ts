import type { ColumnId } from "@packages/shared/config/index";
import type { TaskSummary } from "@packages/shared/types/task/task";

// board/order.ts — optimistic visual order only.
// Server stays authority on positionString via newPosition.
export function spliceTask(
  list: TaskSummary[],
  taskId: string,
  colId: ColumnId,
  overId: string | null,
  before: boolean,
): TaskSummary[] {
  const moving = list.find((t) => t.id === taskId);
  if (!moving) return list; // card already removed, nothing to do

  // Remove first to avoid duplicates in cache.
  const rest = list.filter((t) => t.id !== taskId);
  const moved: TaskSummary = { ...moving, colId }; // target colId, keep old positionString

  // Drop on empty column/area: append at end of target column.
  if (!overId) {
    const last = rest.reduce((acc, t, i) => (t.colId === colId ? i : acc), -1);
    rest.splice(last + 1, 0, moved);
    return rest;
  }

  // Drop on card: before ? insert before : after.
  const idx = rest.findIndex((t) => t.id === overId);
  if (idx === -1) {
    rest.push(moved);
    return rest; // over evicted (race)
  }
  rest.splice(before ? idx : idx + 1, 0, moved);
  return rest;
}
