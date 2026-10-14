import type { PriorityLabel } from "@packages/shared/types/task/priority-level";
import type { Task } from "@packages/shared/types/task/task";
import { useEffect, useState } from "react";
import { createLogger } from "@/src/shared/api/logger";
import { useAsyncHandler } from "@/src/shared/hooks/useAsyncHandler";

const log = createLogger("task/useTaskForm");

// Hook pour gérer l'état du formulaire et la logique de sauvegarde avec gestion d'erreur
export function useTaskForm(
  task: Task | null,
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
      log.error("Erreur sauvegarde tâche", msg);
    },
  });

  // Sync local state when the selected task changes (by ID only —
  // using `task` would re-fire on every parent render).
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional — task?.id is the only meaningful dep
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description ?? "");
      setPriority(task.priority ?? "none");
      setDueDate(task.dueDate ?? null);
      setError(null);
    }
  }, [task?.id]);

  const handleSave = () => {
    if (!task || !onUpdate) return;
    const hasChanged =
      title !== task.title ||
      description !== (task.description ?? "") ||
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
