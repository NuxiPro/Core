import type { Task } from "@packages/shared/types/task/task";
import { useTranslation } from "react-i18next";
import i18n from "@/src/features/i18n";
import { formatRelativeDate } from "../utils/formatRelativeDate";

interface MetadataSectionProps {
  task: Task | null;
  userInitial?: string;
}

const isSameTimestamp = (a?: string, b?: string): boolean => {
  if (!a || !b) return false;
  const diff = Math.abs(new Date(a).getTime() - new Date(b).getTime());
  return diff < 2000;
};

export function MetadataSection({
  task,
  userInitial = "?",
}: MetadataSectionProps) {
  const { t } = useTranslation();
  if (!task) return null;

  const hasBeenEdited =
    task.updatedAt && !isSameTimestamp(task.createdAt, task.updatedAt);

  return (
    <div className="px-4 py-3">
      <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
        {t("task.activity")}
      </h3>

      <div className="relative pl-6">
        <div className="absolute left-[8px] top-1 bottom-1 w-px bg-border" />

        <div className="space-y-3">
          {task.dueDate && (
            <div className="relative flex items-start gap-2">
              <div className="absolute -left-6 top-0 w-4 h-4 rounded-full bg-teal-500/15 border border-teal-500/25 flex items-center justify-center">
                <span className="text-[9px] font-bold text-teal-600 dark:text-teal-400">
                  D
                </span>
              </div>
              <div>
                <p className="text-[11px] text-foreground leading-relaxed">
                  {t("metadata.dueDate")}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {new Date(task.dueDate).toLocaleDateString(
                    i18n.language || "en",
                    { dateStyle: "medium" },
                  )}
                </p>
              </div>
            </div>
          )}
          {hasBeenEdited && (
            <div className="relative flex items-start gap-2">
              <div className="absolute -left-6 top-0 w-4 h-4 rounded-full bg-violet-500/15 border border-violet-500/25 flex items-center justify-center">
                <span className="text-[9px] font-bold text-violet-600 dark:text-violet-400">
                  {userInitial}
                </span>
              </div>
              <div>
                <p className="text-[11px] text-foreground leading-relaxed">
                  {t("task.taskModified")}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {formatRelativeDate(task.updatedAt)}
                </p>
              </div>
            </div>
          )}

          <div className="relative flex items-start gap-2">
            <div className="absolute -left-6 top-0 w-4 h-4 rounded-full bg-violet-500/15 border border-violet-500/25 flex items-center justify-center">
              <span className="text-[9px] font-bold text-violet-600 dark:text-violet-400">
                {userInitial}
              </span>
            </div>
            <div>
              <p className="text-[11px] text-foreground leading-relaxed">
                {t("task.taskCreated")}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {formatRelativeDate(task.createdAt)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
