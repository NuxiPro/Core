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
      // Rollback + bannière rate-limit déjà gérés en amont : on absorbe ici
      // pour éviter unhandled rejection (ex: 429).
      void Promise.resolve(onAdd(data)).catch(() => {});
      setIsFormOpen(false);
    },
    [onAdd],
  );

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col h-full min-h-0 shrink-0 rounded-2xl bg-muted dark:bg-card border border-border-column shadow-[0_1px_3px_0_rgba(17,19,24,0.06),0_4px_16px_0_rgba(17,19,24,0.06)] dark:shadow-[0_2px_8px_0_rgba(0,0,0,0.45)] transition-all duration-200 ${isOver ? "bg-accent dark:bg-popover border-primary/40 dark:border-primary/30 shadow-[0_4px_16px_0_rgba(94,106,210,0.12)]" : ""}`}
      data-column={colId}
    >
      <ColumnHeader
        cfg={cfg}
        tasks={tasks}
        onArchiveView={colId === "Done" ? onArchiveOpen : undefined}
      />
      <div
        className={`mx-2 mb-1 min-h-0 flex-1 flex flex-col overflow-hidden rounded-xl bg-background shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-all duration-300 ${isOver ? "border border-primary/50 ring-2 ring-primary/15" : "border border-transparent"}`}
      >
        <TaskList
          colId={colId}
          isLoading={isLoading}
          tasks={tasks}
          selectedTaskId={selectedTaskId}
          onSelectTask={selectTask}
          onDeleteTask={onDelete}
          activeTaskId={activeTaskId}
        />
      </div>

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
          key={`${selectedTaskId}-${selectedTask ? "full" : "summary"}`}
          mode="edit"
          task={
            selectedTask ?? tasks.find((t) => t.id === selectedTaskId) ?? null
          }
          onClose={clearSelectedTask}
          onUpdate={onUpdate}
        />
      )}
    </div>
  );
}

const Column = memo(ColumnInner);
export default Column;
