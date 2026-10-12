import type { TaskModalProps } from "@packages/shared/types/components";
import { TaskModalCreate } from "./TaskModalCreate";
import { TaskModalEdit } from "./TaskModalEdit";

export default function TaskModal(props: TaskModalProps) {
  if (props.mode === "edit")
    return (
      <TaskModalEdit
        task={props.task}
        onClose={props.onClose}
        onUpdate={props.onUpdate}
      />
    );
  return (
    <TaskModalCreate
      colId={props.colId}
      columnTitle={props.columnTitle}
      prefix={props.prefix}
      onAdd={props.onAdd}
      open={props.open}
      onOpenChange={props.onOpenChange}
    />
  );
}
