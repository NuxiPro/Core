/**
 * TaskList
 * Independent column scroll with custom scrollbar, SortableContext per column.
 * Uses @tanstack/react-virtual for virtualized rendering of long task lists.
 */

import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { ColumnId } from "@packages/shared/config/index";
import type { TaskListProps } from "@packages/shared/types/components";
import { useVirtualizer } from "@tanstack/react-virtual";
import { CheckCircle2, Inbox } from "lucide-react";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { Loader } from "@/src/layout/components/animation/loading/Loader";
import TaskCard from "../task/card/TaskCardView";
import { EmptyState } from "./EmptyState";

const TASK_CARD_HEIGHT = 120;
const TASK_GAP = 8;

const EMPTY_STATE: Record<
  ColumnId,
  { icon: React.ReactNode; title: string; description: string }
> = {
  todo: {
    icon: <Inbox width={24} height={24} strokeWidth={1.5} />,
    title: "No active tasks",
    description: "Click + to create a task",
  },
  In_Progress: {
    icon: <Inbox width={24} height={24} strokeWidth={1.5} />,
    title: "No tasks in progress",
    description: "Drag a task here to start working on it",
  },
  Done: {
    icon: <CheckCircle2 width={24} height={24} strokeWidth={1.5} />,
    title: "No completed tasks",
    description: "Completed tasks go to archives.",
  },
};

export const TaskList = memo(function TaskList({
  colId,
  isLoading = false,
  tasks,
  selectedTaskId,
  onSelectTask,
  onDeleteTask,
  activeTaskId = null,
}: TaskListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canUp, setCanUp] = useState(false);
  const [canDown, setCanDown] = useState(false);

  const updateEdges = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanUp(el.scrollTop > 4);
    setCanDown(el.scrollTop < el.scrollHeight - el.clientHeight - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateEdges();
    el.addEventListener("scroll", updateEdges, { passive: true });
    window.addEventListener("resize", updateEdges);
    return () => {
      el.removeEventListener("scroll", updateEdges);
      window.removeEventListener("resize", updateEdges);
    };
  }, [updateEdges]);
  // Recalcule les fades quand le nombre de tâches change (hauteur du contenu).
  useEffect(() => {
    if (tasks.length >= 0) updateEdges();
  }, [updateEdges, tasks.length]);
  const hasContent = tasks && tasks.length > 0;
  const isEmpty = !isLoading && !hasContent;
  const shouldVirtualize = tasks.length > 20;

  const virtualizer = useVirtualizer({
    count: shouldVirtualize ? tasks.length : 0,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => TASK_CARD_HEIGHT + TASK_GAP,
    overscan: 5,
  });

  const sortableItems = tasks.map((t) => t.id);

  return (
    <div className="relative flex-1 min-h-0 flex flex-col">
      <div
        aria-hidden
        className={`pointer-events-none absolute top-0 inset-x-3 h-6 z-10 rounded-t-lg bg-gradient-to-b from-card to-transparent transition-opacity duration-300 ${canUp ? "opacity-100" : "opacity-0"}`}
      />
      <section
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-y-contain flex flex-col gap-2 px-3 pt-1 pb-2 scrollbar-thin"
        aria-label="Task list"
        aria-busy={isLoading}
      >
      {isLoading ? (
        <div className="h-full flex-1 flex items-center justify-center">
          <Loader />
        </div>
      ) : isEmpty ? (
        <div
          className="flex-1 h-full flex items-center justify-center py-8"
          data-droppable-column={colId}
        >
          <EmptyState
            icon={EMPTY_STATE[colId].icon}
            title={EMPTY_STATE[colId].title}
            description={EMPTY_STATE[colId].description}
          />
        </div>
      ) : (
        <SortableContext
          items={sortableItems}
          strategy={verticalListSortingStrategy}
        >
          {shouldVirtualize ? (
            <ul
              className="relative w-full"
              style={{ height: virtualizer.getTotalSize() }}
              data-droppable-column={colId}
            >
              {virtualizer.getVirtualItems().map((virtualRow) => {
                const task = tasks[virtualRow.index];
                return (
                  <li
                    key={task.id}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    <TaskCard
                      task={task}
                      isSelected={selectedTaskId === task.id}
                      onOpenDetail={onSelectTask}
                      onDelete={onDeleteTask}
                      activeTaskId={activeTaskId}
                    />
                  </li>
                );
              })}
            </ul>
          ) : (
            <ul className="flex flex-col gap-2" data-droppable-column={colId}>
              {tasks.map((task) => (
                <li key={task.id}>
                  <TaskCard
                    task={task}
                    isSelected={selectedTaskId === task.id}
                    onOpenDetail={onSelectTask}
                    onDelete={onDeleteTask}
                    activeTaskId={activeTaskId}
                  />
                </li>
              ))}
            </ul>
          )}
        </SortableContext>
      )}
      </section>
      <div
        aria-hidden
        className={`pointer-events-none absolute bottom-0 inset-x-3 h-6 z-10 rounded-b-lg bg-gradient-to-t from-card to-transparent transition-opacity duration-300 ${canDown ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
});
