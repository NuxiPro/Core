import { DndContext, DragOverlay } from "@dnd-kit/core";
import { COLUMNS, type ColumnId } from "@packages/shared/config/index";
import { COLUMN_IDS } from "@packages/shared/config/index-frontend";
import type { TaskSummary } from "@packages/shared/types/task/task";
import { useEffect, useMemo } from "react";
import { BoardScrollContainer } from "@/src/features/board/components/BoardScrollContainer";
import Column from "@/src/features/board/components/column/Column";
import TaskCardView from "@/src/features/board/components/task/card/TaskCardView";
import { useProjects } from "@/src/features/board/hooks/useProjects";
import { useReorderTask } from "@/src/features/board/hooks/useReorderTask";
import { useTasks } from "@/src/features/board/hooks/useTasks";
import { Route } from "@/src/routes/_dashboard/kanban.$projectSlug";
import { findProjectBySlug } from "@/src/shared/utils/utils";
import { useKanbanDnd } from "../hooks/useKanbanDnd";

export function KanbanBoard() {
  const { projectSlug: slug } = Route.useParams();
  const navigate = Route.useNavigate();
  const { projects, isLoading: isLoadingProjects } = useProjects();

  const matchedProject = useMemo(
    () => findProjectBySlug(projects, slug),
    [projects, slug],
  );
  const projectId = matchedProject?.id ?? null;

  const { tasks, prefix, isLoading, addTask, updateTask, deleteTask } =
    useTasks(projectId);

  const { moveTask } = useReorderTask(projectId);

  // Group by column, preserving cache order (optimistic splice + server order).
  // No re-sort here: sorting by positionString would cancel the local drop.
  const tasksByColumn = useMemo(() => {
    const grouped = {} as Record<ColumnId, TaskSummary[]>;
    for (const colId of COLUMN_IDS) grouped[colId] = [];
    for (const task of tasks) grouped[task.colId]?.push(task);
    return grouped;
  }, [tasks]);

  const {
    activeTask,
    sensors,
    collisionDetection,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  } = useKanbanDnd({
    tasksByColumn,
    onMoveTask: moveTask,
  });

  useEffect(() => {
    if (isLoadingProjects || projects.length === 0 || matchedProject) return;
    const first = projects[0];
    navigate({
      to: "/kanban/$projectSlug",
      params: { projectSlug: first.slug },
      replace: true,
    });
  }, [isLoadingProjects, projects, matchedProject, navigate]);

  if (isLoadingProjects) {
    return (
      <div className="h-full min-h-0 w-full flex items-center justify-center">
        <div className="text-sm text-text-label">Chargement...</div>
      </div>
    );
  }

  if (!projectId) return null;

  return (
    <div className="h-full min-h-0 w-full bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-indigo-500/5 via-surface-workspace to-surface-workspace">
      <BoardScrollContainer showArrows>
        <DndContext
          sensors={sensors}
          collisionDetection={collisionDetection}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          {COLUMN_IDS.map((id) => (
            <div
              key={id}
              className="shrink-0 h-full min-h-0 snap-start w-[85vw] sm:w-[340px] sm:min-w-[300px] lg:flex-1 lg:w-auto lg:min-w-[280px] lg:max-w-[400px] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform"
            >
              <Column
                cfg={COLUMNS[id]}
                colId={id as ColumnId}
                tasks={tasksByColumn[id]}
                prefix={prefix}
                onAdd={addTask}
                onUpdate={updateTask}
                onDelete={deleteTask}
                isLoading={isLoading}
                activeTaskId={activeTask?.id ?? null}
                onArchiveOpen={() =>
                  navigate({
                    to: "/kanban/$projectSlug/archive",
                    params: { projectSlug: slug },
                  })
                }
              />
            </div>
          ))}
          <DragOverlay dropAnimation={null}>
            {activeTask ? (
              <TaskCardView task={activeTask} isOverlay onDelete={() => {}} />
            ) : null}
          </DragOverlay>
        </DndContext>
      </BoardScrollContainer>
    </div>
  );
}
