import type { PriorityLabel } from "@packages/shared/types/task/priority-level";
import type {
  ArchivedTask,
  ArchivedTaskSummary,
  Task,
  TaskSummary,
} from "@packages/shared/types/task/task";
import { useEffect, useState } from "react";
import { useAsyncHandler } from "@/src/shared/hooks/useAsyncHandler";

// Hook pour gérer l'état du formulaire et la logique de sauvegarde avec gestion d'erreur
// `ArchivedTaskSummary` = the light list row: no priority/dueDate/description
// yet, the form only runs once the full detail has arrived.
export function useTaskForm(
  task: Task | TaskSummary | ArchivedTask | ArchivedTaskSummary | null,
  onUpdate?: (
    id: string,
    updates: {
      title: string;
      description: string;
      priority?: PriorityLabel;
      dueDate?: string | null;
    },
  ) => Promise<void>,
) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<PriorityLabel>("none");
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { isSaving, handle } = useAsyncHandler({
    onError: (msg) => {
      setError(msg);
    },
  });

  // Sync local state when the selected task changes (by ID only —
  // using `task` would re-fire on every parent render).
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional — task?.id is the only meaningful dep
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription("description" in task ? (task.description ?? "") : "");
      // The light summary has no priority/dueDate: default them.
      setPriority("priority" in task ? (task.priority ?? "none") : "none");
      setDueDate("dueDate" in task ? (task.dueDate ?? null) : null);
      setError(null);
    }
  }, [task?.id]);

  const handleSave = () => {
    if (!task || !onUpdate || !("description" in task)) return;
    const taskDescription =
      "description" in task ? (task.description ?? "") : "";
    const hasChanged =
      title !== task.title ||
      description !== taskDescription ||
      priority !== (task.priority ?? "none") ||
      dueDate !== (task.dueDate ?? null);
    if (!hasChanged) return;
    setError(null);
    return handle(() =>
      onUpdate(task.id, { title, description, priority, dueDate }),
    );
  };

  return {
    title,
    setTitle,
    description,
    setDescription,
    priority,
    setPriority,
    dueDate,
    setDueDate,
    handleSave,
    isSaving,
    error,
  };
}
