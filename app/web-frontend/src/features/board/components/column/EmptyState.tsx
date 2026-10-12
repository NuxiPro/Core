/**
 * EmptyState
 * Dashed placeholder slot — minimal geometric icon, lightweight micro-copy.
 */

import type { EmptyStateProps as SharedEmptyStateProps } from "@packages/shared/types/components";
import type { ReactNode } from "react";
import { memo } from "react";

// Frontend affine le type générique `unknown` du shared en `ReactNode`
type EmptyStateProps = Omit<SharedEmptyStateProps, "icon" | "action"> & {
  icon?: ReactNode;
  action?: ReactNode;
};

export const EmptyState = memo(function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full border border-dashed border-border-column rounded-xl p-6 text-center">
      {icon && (
        <div className="mb-2.5 text-slate-400 dark:text-text-muted-hard">
          {icon}
        </div>
      )}

      <h3 className="text-xs font-medium text-text-label mb-1">{title}</h3>

      {description && (
        <p className="text-[11px] text-text-muted-hard">{description}</p>
      )}

      {action && <div className="mt-3">{action}</div>}
    </div>
  );
});
