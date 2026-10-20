/**
 * priority.tsx — source unique priorité (icône + select)
 * Fusion de priority-constants.tsx + priority-select.tsx
 */
import type { PriorityLabel } from "@packages/shared/types/task/priority-level";
import {
  ICON_COLORS,
  PRIORITY_NONE_CHAR,
  PRIORITY_ORDER,
  priorityStyles,
} from "@packages/shared/types/task/priority-level";
import {
  AlertTriangle,
  Check,
  ChevronDown,
  Equal,
  Menu,
  Minus,
} from "lucide-react";
import { memo, useCallback } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/layout/components/ui/dropdown-menu";
import { cn } from "@/src/shared/utils/utils";

// ─── Icônes ────────────────────────────────────────────────────────────────
export const PRIORITY_ICONS: Record<
  PriorityLabel,
  React.ComponentType<{ className?: string; strokeWidth?: number }>
> = {
  none: Minus,
  low: Minus,
  medium: Equal,
  high: Menu,
  urgent: AlertTriangle,
};

export function PriorityIcon({
  priority,
  className,
}: {
  priority: PriorityLabel;
  className?: string;
}) {
  const color = ICON_COLORS[priority];
  const Icon = PRIORITY_ICONS[priority];
  if (priority === "none")
    return <span className={className}>{PRIORITY_NONE_CHAR}</span>;
  return <Icon className={`${color} ${className ?? ""}`} />;
}

// ─── Select ────────────────────────────────────────────────────────────────
interface PrioritySelectProps {
  value: PriorityLabel;
  onValueChange: (priority: PriorityLabel) => void;
  compact?: boolean;
}

export const PrioritySelect = memo(function PrioritySelect({
  value,
  onValueChange,
  compact = false,
}: PrioritySelectProps) {
  const currentStyle = priorityStyles[value];
  const handleSelect = useCallback(
    (priority: PriorityLabel) => onValueChange(priority),
    [onValueChange],
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex items-center justify-between gap-2 rounded-xl",
            compact
              ? "w-auto px-2.5 py-1.5 text-[13px]"
              : "w-full px-3 py-2 text-sm",
            "transition-all duration-300 ease-spring",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
            "cursor-pointer",
            "bg-white dark:bg-card border border-border-subtle dark:border-border hover:border-[#cbd0dc] dark:hover:border-border-subtle hover:shadow-sm shadow-sm",
          )}
        >
          <div className="flex items-center gap-2">
            <PriorityIcon priority={value} className="size-3.5" />
            <span
              className={cn(
                "font-medium text-foreground",
                compact ? "text-[13px]" : "text-sm",
              )}
            >
              {currentStyle.label}
            </span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        sideOffset={4}
        className="w-[180px] rounded-xl border border-border-subtle dark:border-border bg-card dark:bg-popover shadow-[0_8px_24px_rgba(17,19,24,0.08),0_16px_48px_rgba(17,19,24,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] p-1.5"
      >
        {PRIORITY_ORDER.map((p) => {
          const style = priorityStyles[p];
          const isActive = value === p;
          return (
            <DropdownMenuItem
              key={p}
              onClick={() => handleSelect(p)}
              className={cn(
                "flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer",
                "bg-transparent transition-all duration-200 ease-spring",
                "focus:outline-none focus:bg-transparent focus:text-inherit",
                isActive
                  ? "bg-primary/10 dark:bg-primary/15 font-medium"
                  : "hover:bg-background dark:hover:bg-card",
              )}
            >
              <PriorityIcon priority={p} className="size-3.5" />
              <span
                className={cn(
                  "text-sm flex-1",
                  isActive
                    ? "text-primary dark:text-primary-hover font-medium"
                    : "text-foreground",
                )}
              >
                {style.label}
              </span>
              {isActive && (
                <Check className="w-3.5 h-3.5 text-primary dark:text-primary-hover shrink-0" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});
