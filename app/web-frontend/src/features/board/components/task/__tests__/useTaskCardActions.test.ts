import type { TaskSummary } from "@packages/shared/types/task/task";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useTaskCardActions } from "../card/useTaskCardActions";

function makeTask(overrides: Partial<TaskSummary> = {}): TaskSummary {
  return {
    id: "task-1",
    title: "Test",
    colId: "progress",
    ...overrides,
  } as TaskSummary;
}

describe("useTaskCardActions", () => {
  it("handleCardClick appelle onOpenDetail avec l'id de la tâche", () => {
    const onDelete = vi.fn();
    const onOpenDetail = vi.fn();
    const task = makeTask({ id: "abc" });

    const { result } = renderHook(() =>
      useTaskCardActions({ task, onDelete, onOpenDetail }),
    );

    act(() => result.current.handleCardClick());

    expect(onOpenDetail).toHaveBeenCalledWith("abc");
    expect(onDelete).not.toHaveBeenCalled();
  });

  it("handleCardClick ne throw pas si onOpenDetail est undefined", () => {
    const onDelete = vi.fn();
    const task = makeTask();

    const { result } = renderHook(() => useTaskCardActions({ task, onDelete }));

    expect(() => act(() => result.current.handleCardClick())).not.toThrow();
    expect(onDelete).not.toHaveBeenCalled();
  });

  it("handleDelete stoppe la propagation et appelle onDelete immédiatement", () => {
    const onDelete = vi.fn();
    const onOpenDetail = vi.fn();
    const task = makeTask({ id: "to-del" });

    const stopPropagation = vi.fn();
    const fakeEvent = {
      stopPropagation,
    } as unknown as React.MouseEvent<HTMLButtonElement>;

    const { result } = renderHook(() =>
      useTaskCardActions({ task, onDelete, onOpenDetail }),
    );

    act(() => result.current.handleDelete(fakeEvent));

    expect(stopPropagation).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledWith("to-del");
  });
});
