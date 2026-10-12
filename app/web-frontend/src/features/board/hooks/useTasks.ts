import type {
  CreateTaskInput,
  Task,
  TaskSummary,
} from "@packages/shared/types/task/task";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createTask as createTaskApi,
  deleteTask as deleteTaskApi,
  getBoard,
  getTaskById,
  updateTask as updateTaskApi,
} from "../api/tasks";
import { type BoardData, mergeBoard } from "../types/board";
import { useOptimisticMutation } from "./useOptimisticMutation";

const boardQueryKey = (projectId: string | null) =>
  ["board", projectId] as const;

export function useTasks(projectId: string | null) {
  const queryClient = useQueryClient();

  const requireProjectId = () => {
    if (!projectId) throw new Error("A project is required");
    return projectId;
  };

  // Board query: disabled until a valid project is selected.
  const { data, isLoading } = useQuery({
    queryKey: boardQueryKey(projectId),
    queryFn: () => getBoard(requireProjectId()),
    enabled: !!projectId,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const tasks = data?.tasks ?? [];
  const prefix = data?.prefix ?? "";
  const projectName = data?.name ?? "";

  // Create mutation: show a temporary task, then replace it with the server task.
  const addTask = useOptimisticMutation<Task, CreateTaskInput>(
    projectId,
    (input) => createTaskApi({ ...input, projectId: requireProjectId() }),
    (input, old, ctx) => {
      // The temporary ID is generated once in onMutate and reused here.
      const optimisticTask: TaskSummary = {
        id: (ctx.extra.tempId as string) ?? `temp-${Date.now()}`,
        title: input.title,
        colId: input.colId,
        // Visual order comes from array position (splice), not this string.
        // Server replaces it with the real fractional key in onSuccess.
        positionString: "",
        createdAt: new Date().toISOString(),
      };
      // Insert after last task of target column to keep flat order tidy.
      const prev = old.tasks ?? [];
      const last = prev.reduce(
        (acc, t, i) => (t.colId === input.colId ? i : acc),
        -1,
      );
      const next = [...prev];
      next.splice(last + 1, 0, optimisticTask);
      return mergeBoard(old, { tasks: next });
    },
    {
      contextExtra: () => ({
        tempId: `temp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      }),
      onSuccess: (createdTask, _vars, ctx) => {
        const tempId = ctx.extra.tempId as string | undefined;
        if (!tempId) return;
        queryClient.setQueryData<BoardData>(boardQueryKey(projectId), (old) =>
          mergeBoard(old, {
            tasks: (old?.tasks ?? []).map((t) =>
              t.id === tempId
                ? { ...createdTask, priority: createdTask.priority ?? "none" }
                : t,
            ),
          }),
        );
      },
    },
  );

  // Update mutation: update the board optimistically and refresh the detail cache.
  const updateTask = useOptimisticMutation<
    Task,
    { id: Task["id"]; updates: Partial<Task> }
  >(
    projectId,
    ({ id, updates }) => updateTaskApi(id, updates),
    ({ id, updates }, old) =>
      mergeBoard(old, {
        tasks: (old.tasks ?? []).map((t) =>
          t.id === id ? { ...t, ...updates } : t,
        ),
      }),
    {
      onSuccess: (updatedTask, variables) =>
        queryClient.setQueryData<Task>(["task", variables.id], updatedTask),
    },
  );

  // Delete mutation: remove the task optimistically and roll back on failure.
  const deleteTask = useOptimisticMutation<void, Task["id"]>(
    projectId,
    (id) => deleteTaskApi(id),
    (id, old) =>
      mergeBoard(old, { tasks: (old.tasks ?? []).filter((t) => t.id !== id) }),
  );

  return {
    tasks,
    prefix,
    projectName,
    isLoading,
    addTask: addTask.mutateAsync,
    updateTask: (id: Task["id"], updates: Partial<Task>) =>
      updateTask.mutateAsync({ id, updates }),
    deleteTask: deleteTask.mutateAsync,
  };
}

// Detail query: loaded only when a task is selected.
export function useTaskDetail(taskId: string | null) {
  return useQuery<Task>({
    queryKey: ["task", taskId],
    queryFn: () => {
      if (!taskId) throw new Error("taskId is required");
      return getTaskById(taskId);
    },
    enabled: !!taskId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
