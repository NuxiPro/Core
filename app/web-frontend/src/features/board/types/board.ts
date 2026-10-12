import type { TaskSummary } from "@packages/shared/types/task/task";

export type BoardData = {
  id: string;
  name: string;
  prefix: string;
  description: string | null;
  createdAt: string;
  tasks?: TaskSummary[];
};

/** Merge old board data with partial overrides — covers the 5x copy-paste pattern. */
export const mergeBoard = (
  old: BoardData | undefined,
  overrides: Partial<BoardData> = {},
): BoardData => ({
  id: old?.id ?? "",
  name: old?.name ?? "",
  prefix: old?.prefix ?? "",
  description: old?.description ?? null,
  createdAt: old?.createdAt ?? "",
  ...overrides,
});
