export type PriorityLabel = "low" | "medium" | "high" | "urgent" | "none";

export const PRIORITY_ORDER: PriorityLabel[] = [
  "none",
  "low",
  "medium",
  "high",
  "urgent",
];

export const PRIORITY_NONE_CHAR = "◌";

export const ICON_COLORS: Record<PriorityLabel, string> = {
  none: "text-muted-foreground",
  low: "text-sky-400",
  medium: "text-amber-500",
  high: "text-orange-400",
  urgent: "text-rose-400",
};

export const PRIORITY_GLOW: Record<PriorityLabel, string> = {
  urgent: "hover:shadow-[0_8px_32px_rgba(239,68,68,0.08)]",
  high: "hover:shadow-[0_8px_32px_rgba(249,115,22,0.07)]",
  medium: "hover:shadow-[0_8px_32px_rgba(234,179,8,0.06)]",
  low: "hover:shadow-[0_8px_32px_rgba(56,189,248,0.07)]",
  none: "",
};

export const priorityStyles = {
  urgent: {
    border: "border-l-4 border-rose-500",
    bg: "bg-rose-500/15",
    text: "text-rose-400",
    dot: "bg-rose-400",
    triggerBg: "bg-rose-500/[0.06]",
    triggerBorder: "border-rose-500/20",
    itemActive: "bg-rose-500/[0.08]",
    label: "Urgent",
  },
  high: {
    border: "border-l-4 border-orange-500",
    bg: "bg-orange-500/15",
    text: "text-orange-400",
    dot: "bg-orange-400",
    triggerBg: "bg-orange-500/[0.06]",
    triggerBorder: "border-orange-500/20",
    itemActive: "bg-orange-500/[0.08]",
    label: "High",
  },
  medium: {
    border: "border-l-4 border-amber-500",
    bg: "bg-amber-500/15",
    text: "text-amber-500",
    dot: "bg-amber-500",
    triggerBg: "bg-amber-500/[0.06]",
    triggerBorder: "border-amber-500/20",
    itemActive: "bg-amber-500/[0.08]",
    label: "Medium",
  },
  low: {
    border: "border-l-4 border-sky-500",
    bg: "bg-sky-500/15",
    text: "text-sky-400",
    dot: "bg-sky-400",
    triggerBg: "bg-sky-500/[0.06]",
    triggerBorder: "border-sky-500/20",
    itemActive: "bg-sky-500/[0.08]",
    label: "Low",
  },
  none: {
    border: "border-l-4 border-transparent",
    bg: "bg-transparent",
    text: "text-neutral-500",
    dot: "bg-neutral-500",
    triggerBg: "bg-[#18181b]/60",
    triggerBorder: "border-white/[0.04]",
    itemActive: "bg-white/[0.04]",
    label: "No priority",
  },
};
