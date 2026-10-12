import type { ColumnId } from "@packages/shared/config/index";
import { useQueryClient } from "@tanstack/react-query";
import { moveTask } from "../api/tasks";
import type { BoardData } from "../types/board";
import { mergeBoard } from "../types/board";
import { spliceTask } from "../types/order";
import { useOptimisticMutation } from "./useOptimisticMutation";

type ReorderVars = {
  taskId: string;
  colId: ColumnId;
  overTaskId: string | null;
  insertBefore: boolean;
};

type ReorderData = {
  success: boolean;
  newPosition: string;
};

export function useReorderTask(projectId: string | null) {
  const queryClient = useQueryClient();

  const mutation = useOptimisticMutation<ReorderData, ReorderVars>(
    projectId,
    (variables) => moveTask(variables.taskId, variables),
    // Real optimistic reorder: splice locally for instant drop feedback.
    // Server stays authority and overwrites with newPosition in onSuccess.
    (variables, board) =>
      mergeBoard(board, {
        tasks: spliceTask(
          board.tasks ?? [],
          variables.taskId,
          variables.colId,
          variables.overTaskId,
          variables.insertBefore,
        ),
      }),
    {
      // Apply the authoritative position returned by the server.
      onSuccess: (data, variables) => {
        queryClient.setQueryData<BoardData>(["board", projectId], (board) =>
          !board?.tasks
            ? board
            : mergeBoard(board, {
                tasks: board.tasks.map((task) =>
                  task.id === variables.taskId
                    ? {
                        ...task,
                        colId: variables.colId,
                        positionString: data.newPosition,
                      }
                    : task,
                ),
              }),
        );
      },
      invalidateOnSettled: false,
    },
  );

  return {
    moveTask: mutation.mutateAsync,
    isLoading: mutation.isPending,
  };
}
