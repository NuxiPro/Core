import type { ColumnConfig, ColumnId } from "../../config/index";
import type { CreateTaskInput, Task, TaskSummary } from "../task/task";

// Reusable handlers — DRY
export type TaskId = Task["id"];
export type TaskUpdateHandler = (
  taskId: TaskId,
  updates: Partial<Task>,
) => Promise<unknown>;
export type TaskDeleteHandler = (taskId: TaskId) => void;
export type TaskSelectHandler = (taskId: TaskId) => void;

// Colonnes
export interface ColumnHeaderProps {
  cfg: ColumnConfig;
  tasks: TaskSummary[];
  onAddTask?: (() => void) | undefined;
}

export interface TaskColumnProps {
  cfg: ColumnConfig;
  colId: ColumnId;
  tasks: TaskSummary[];
  onAdd: (data: CreateTaskInput) => void;
  onUpdate?: TaskUpdateHandler | undefined;
  onDelete: TaskDeleteHandler;
  isLoading?: boolean | undefined;
  prefix?: string | undefined;
  activeTaskId?: TaskId | null | undefined;
}

// Cartes
export interface TaskCardProps {
  task: TaskSummary;
  onDelete: TaskDeleteHandler;
}

export interface TaskCardExtendedProps extends TaskCardProps {
  isSelected?: boolean | undefined;
  onOpenDetail?: TaskSelectHandler | undefined;
  isOverlay?: boolean | undefined;
  activeTaskId?: string | null | undefined;
}

export interface UseTaskCardActionsParams {
  task: TaskSummary;
  onDelete: TaskDeleteHandler;
  onOpenDetail?: TaskSelectHandler | undefined;
}

export interface BoardScrollContainerProps {
  children: unknown;
  showArrows?: boolean | undefined;
}

export interface TaskListProps {
  colId: ColumnId;
  isLoading?: boolean | undefined;
  tasks: TaskSummary[];
  selectedTaskId: string | null;
  onSelectTask: TaskSelectHandler;
  onDeleteTask: TaskDeleteHandler;
  activeTaskId?: string | null | undefined;
}

// Modals
export interface TaskModalCreateProps {
  colId: ColumnId;
  columnTitle: string;
  prefix?: string | undefined;
  onAdd: (data: CreateTaskInput) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface TaskModalEditProps {
  task: Task | TaskSummary | null;
  onClose: () => void;
  onUpdate?: TaskUpdateHandler | undefined;
}

export type TaskModalProps =
  | ({ mode: "create" } & TaskModalCreateProps)
  | ({ mode: "edit" } & TaskModalEditProps);

export interface EmptyStateProps {
  icon?: unknown;
  title: string;
  description?: string;
  action?: unknown;
}
