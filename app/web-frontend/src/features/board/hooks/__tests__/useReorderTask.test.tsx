import type { TaskSummary } from "@packages/shared/types/task/task";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { moveTaskMock } = vi.hoisted(() => ({ moveTaskMock: vi.fn() }));

vi.mock("../../api/tasks", () => ({ moveTask: moveTaskMock }));

import type { BoardData } from "../../types/board";
import { useReorderTask } from "../useReorderTask";

const projectId = "01990000-0000-7000-8000-000000000001";

// Fresh client per test — module-level so Wrapper stays a plain component.
let queryClient: QueryClient;

function Wrapper({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

const makeTask = (id: string, colId: TaskSummary["colId"]): TaskSummary => ({
  id,
  projectId,
  title: `Task ${id}`,
  colId,
  createdAt: "2026-01-01T00:00:00.000Z",
  positionString: "a0",
});

const makeBoard = (tasks: TaskSummary[]): BoardData => ({
  id: projectId,
  name: "Project",
  prefix: "PRJ",
  description: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  tasks,
});

beforeEach(() => {
  vi.clearAllMocks();
  queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
});

describe("useReorderTask", () => {
  it("keeps the task on the board for the exit animation, then removes it when the server archived it", async () => {
    const task = makeTask("task-1", "todo");
    queryClient.setQueryData(["board", projectId], makeBoard([task]));
    queryClient.setQueryData(["archived", projectId], []);
    moveTaskMock.mockResolvedValue({ success: true, archived: true });

    const { result } = renderHook(() => useReorderTask(projectId), {
      wrapper: Wrapper,
    });

    await result.current.moveTask({
      taskId: task.id,
      colId: "Done",
      overTaskId: null,
      insertBefore: false,
    });

    // The card must stay on the board first — it plays its "filed away"
    // animation before the cache drops it.
    await waitFor(() => {
      expect(result.current.archivingIds).toContain(task.id);
    });
    const during = queryClient.getQueryData<BoardData>(["board", projectId]);
    expect(during?.tasks?.some((t) => t.id === task.id)).toBe(true);
    // The archive button pulses so the user sees where the task went.
    expect(result.current.isArchivePulsing).toBe(true);

    // Removal is delayed on purpose (750ms) — give the timer room to run.
    await waitFor(
      () => {
        const board = queryClient.getQueryData<BoardData>(["board", projectId]);
        expect(board?.tasks?.some((t) => t.id === task.id)).toBe(false);
      },
      { timeout: 2000 },
    );
    expect(result.current.archivingIds).not.toContain(task.id);
    expect(
      queryClient.getQueryState(["archived", projectId])?.isInvalidated,
    ).toBe(true);
  });

  it("keeps the task and applies the server position when it was only moved", async () => {
    const task = makeTask("task-1", "todo");
    const other = makeTask("task-2", "In_Progress");
    queryClient.setQueryData(["board", projectId], makeBoard([task, other]));
    queryClient.setQueryData(["archived", projectId], []);
    moveTaskMock.mockResolvedValue({
      success: true,
      archived: false,
      newPosition: "a1",
    });

    const { result } = renderHook(() => useReorderTask(projectId), {
      wrapper: Wrapper,
    });

    await result.current.moveTask({
      taskId: task.id,
      colId: "In_Progress",
      overTaskId: other.id,
      insertBefore: true,
    });

    await waitFor(() => {
      const board = queryClient.getQueryData<BoardData>(["board", projectId]);
      const moved = board?.tasks?.find((t) => t.id === task.id);
      expect(moved?.colId).toBe("In_Progress");
      expect(moved?.positionString).toBe("a1");
    });
    // A plain move must not pulse the archive button.
    expect(result.current.isArchivePulsing).toBe(false);
    expect(
      queryClient.getQueryState(["archived", projectId])?.isInvalidated,
    ).toBe(false);
  });
});
