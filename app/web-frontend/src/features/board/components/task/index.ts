// Barrel task — 1 import au lieu de 7 dossiers
// card

export { PRIORITY_ICONS, PriorityIcon, PrioritySelect } from "./card/priority";
export { default as TaskCardView } from "./card/TaskCardView";
export { useTaskCardActions } from "./card/useTaskCardActions";
// editor
export {
  EditorFallback,
  type EditorHandle,
  LazyTipTapEditor,
  TipTapEditor,
} from "./editor";
export { useTaskForm } from "./hooks/useTaskForm";
// modals
export { default as TaskModal } from "./modals/TaskModal";
export { TaskModalCreate } from "./modals/TaskModalCreate";
export { TaskModalEdit } from "./modals/TaskModalEdit";
// sections / hooks / utils
export { MetadataSection } from "./sections/MetadataSection";
export { formatRelativeDate } from "./utils/formatRelativeDate";
