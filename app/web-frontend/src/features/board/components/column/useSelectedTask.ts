import type { TaskSummary } from "@packages/shared/types/task/task";
import { useEffect, useState } from "react";

export function useSelectedTask(tasks: TaskSummary[]) {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  useEffect(() => {
    if (selectedTaskId && !tasks.some((t) => t.id === selectedTaskId)) {
      setSelectedTaskId(null);
    }
  }, [tasks, selectedTaskId]);

  return {
    selectedTaskId,
    selectTask: setSelectedTaskId,
    clearSelectedTask: () => setSelectedTaskId(null),
  };
}
