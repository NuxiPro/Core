import { useDroppable } from "@dnd-kit/core";
import type { TaskColumnProps } from "@packages/shared/types/components/index";
import { Plus } from "lucide-react";
import { memo, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  const { data: selectedTask } = useTaskDetail(selectedTaskId);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const canAdd = colId !== "Done";
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

      {canAdd && (
        <div className="px-2 pb-2 pt-1 flex-shrink-0">
          <button
            type="button"
            onClick={handleAddTask}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Plus width={15} height={15} strokeWidth={2.5} />
            {t("column.addTask")}
          </button>
        </div>
      )}

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
