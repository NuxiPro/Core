import { useDroppable } from "@dnd-kit/core";
import type { TaskColumnProps } from "@packages/shared/types/components/index";
import { memo, useCallback, useState } from "react";
import TaskModal from "@/src/features/board/components/task/modals/TaskModal";
import { useTaskDetail } from "@/src/features/board/hooks/useTasks";
import ColumnHeader from "./ColumnHeader";
import { TaskList } from "./TaskList";
import { useSelectedTask } from "./useSelectedTask";

function ColumnInner({
  cfg,
  colId,
  tasks,
  prefix,
  onAdd,
  onUpdate,
  onDelete,
  isLoading = false,
  activeTaskId = null,
  onArchiveOpen,
}: TaskColumnProps & { onArchiveOpen?: () => void }) {
  const { selectedTaskId, selectTask, clearSelectedTask } =
    useSelectedTask(tasks);
  const { data: selectedTask } = useTaskDetail(selectedTaskId);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { setNodeRef, isOver } = useDroppable({
    id: colId,
    data: { type: "column", status: colId },
  });

  const handleAddTask = useCallback(() => setIsFormOpen(true), []);
  const handleFormAdd = useCallback(
    (data: Parameters<typeof onAdd>[0]) => {
      onAdd(data);
      setIsFormOpen(false);
    },
    [onAdd],
  );

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col min-h-[calc(100vh-120px)] h-full shrink-0 rounded-2xl bg-muted dark:bg-card border border-border-subtle dark:border-border-subtle shadow-[0_1px_3px_0_rgba(17,19,24,0.06),0_4px_16px_0_rgba(17,19,24,0.06)] dark:shadow-[0_2px_8px_0_rgba(0,0,0,0.45)] transition-all duration-200 ${isOver ? "bg-accent dark:bg-popover border-primary/40 dark:border-primary/30 shadow-[0_4px_16px_0_rgba(94,106,210,0.12)]" : ""}`}
      data-column={colId}
    >
      <ColumnHeader
        cfg={cfg}
        tasks={tasks}
        onAddTask={colId === "Done" ? undefined : handleAddTask}
        onArchiveView={colId === "Done" ? onArchiveOpen : undefined}
      />
      <TaskList
        colId={colId}
        isLoading={isLoading}
        tasks={tasks}
        selectedTaskId={selectedTaskId}
        onSelectTask={selectTask}
        onDeleteTask={onDelete}
        activeTaskId={activeTaskId}
      />

      {isFormOpen && (
        <TaskModal
          mode="create"
          colId={colId}
          columnTitle={cfg.title}
          prefix={prefix}
          onAdd={handleFormAdd}
          open
          onOpenChange={setIsFormOpen}
        />
      )}

      {selectedTaskId && (
        <TaskModal
          mode="edit"
          task={selectedTask ?? null}
          onClose={clearSelectedTask}
          onUpdate={onUpdate}
        />
      )}
    </div>
  );
}

const Column = memo(ColumnInner);
export default Column;
