/**
 * EmptyState
 * Colonne vide façon Trello : contenu fantôme centré, sans boîte —
 * tout le puits est la zone de drop.
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
    <div className="flex flex-col items-center justify-center h-full px-6 py-10 text-center select-none">
      {icon && (
        <div className="mb-2.5 text-slate-400 dark:text-text-muted-hard opacity-60">
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
