import type { ColumnId } from "@packages/shared/config/index";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { moveTask } from "../api/tasks";
import type { BoardData } from "../types/board";
import { mergeBoard } from "../types/board";
import { spliceTask } from "../types/order";
import { useOptimisticMutation } from "./useOptimisticMutation";

// How long the card plays its "filed away" animation before leaving the
// board cache. Keep in sync with .task-card--archiving in global.css
// (700ms animation + a small buffer so the fade finishes first).
const ARCHIVE_ANIMATION_MS = 750;

// How long the Done column's archive button keeps its pulse class after
// an archive: one beat of 900ms (see .archive-button--pulse) plus a small
// buffer, then the class drops so the next archive can trigger again.
const ARCHIVE_PULSE_MS = 1000;

type ReorderVars = {
  taskId: string;
  colId: ColumnId;
  overTaskId: string | null;
  insertBefore: boolean;
};

type ReorderData = {
  success: boolean;
  // true = instant archive mode: the task went to the archive instead of
  // staying in Done, so it must leave the board cache.
  archived: boolean;
  newPosition?: string | undefined;
};

export function useReorderTask(projectId: string | null) {
  const queryClient = useQueryClient();
  // Tasks currently playing their archive exit animation. The card stays
  // visible until the timer below drops it from the cache.
  const [archivingIds, setArchivingIds] = useState<readonly string[]>([]);
  // true right after an archive, so the Done column's archive button
  // beats once and the user sees where the task went.
  const [isArchivePulsing, setIsArchivePulsing] = useState(false);

  // Show one beat by keeping the pulse class on for a short window — it
  // has to come off again so the next archive can trigger a fresh beat.
  // Left running if the board unmounts first: worst case is a harmless
  // no-op state update.
  const flashArchiveButton = () => {
    setIsArchivePulsing(true);
    setTimeout(() => setIsArchivePulsing(false), ARCHIVE_PULSE_MS);
  };

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
      // Apply the authoritative state returned by the server.
      onSuccess: (data, variables) => {
        // Archived: the task is gone from the board table. First give the
        // card its exit animation, then drop it from the cache (the
        // optimistic drop already put it in Done) and refresh the archive
        // list so the sheet shows it.
        if (data.archived) {
          const taskId = variables.taskId;
          flashArchiveButton();
          setArchivingIds((ids) =>
            ids.includes(taskId) ? ids : [...ids, taskId],
          );
          // Deliberately not cleaned up on unmount: if the board goes away
          // mid-animation, the cache still needs the card removed.
          setTimeout(() => {
            queryClient.setQueryData<BoardData>(
              ["board", projectId],
              (board) =>
                !board?.tasks
                  ? board
                  : mergeBoard(board, {
                      tasks: board.tasks.filter((t) => t.id !== taskId),
                    }),
            );
            setArchivingIds((ids) => ids.filter((id) => id !== taskId));
          }, ARCHIVE_ANIMATION_MS);
          queryClient.invalidateQueries({ queryKey: ["archived", projectId] });
          return;
        }
        queryClient.setQueryData<BoardData>(["board", projectId], (board) =>
          !board?.tasks
            ? board
            : mergeBoard(board, {
                tasks: board.tasks.map((task) =>
                  task.id === variables.taskId
                    ? {
                        ...task,
                        colId: variables.colId,
                        positionString: data.newPosition ?? task.positionString,
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
    // Pass to the board so the matching card can play its exit animation
    // and the Done column's archive button can pulse.
    archivingIds,
    isArchivePulsing,
  };
}
