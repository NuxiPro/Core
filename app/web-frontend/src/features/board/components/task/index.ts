// Barrel task — 1 import au lieu de 7 dossiers
// card

export { PRIORITY_ICONS, PriorityIcon, PrioritySelect } from "./card/priority";
export { default as TaskCardView } from "./card/TaskCardView";
export { useTaskCardActions } from "./card/useTaskCardActions";
// editor – now plain markdown
export { type EditorHandle } from "../../../layout/md-editor/MarkdownEditor";
export { MarkdownEditor as TipTapEditor } from "../../../layout/md-editor/MarkdownEditor"; // keep old name for backward compatibility
export { MarkdownEditor as LazyTipTapEditor } from "../../../layout/md-editor/MarkdownEditor";
export { EditorFallback } from "../../../layout/md-editor/MarkdownEditor"; // dummy fallback (no‑op) to preserve API
export { useTaskForm } from "./hooks/useTaskForm";
// modals
export { default as TaskModal } from "./modals/TaskModal";
export { TaskModalCreate } from "./modals/TaskModalCreate";
export { TaskModalEdit } from "./modals/TaskModalEdit";
// sections / hooks / utils
export { MetadataSection } from "./sections/MetadataSection";
export { formatRelativeDate } from "./utils/formatRelativeDate";
