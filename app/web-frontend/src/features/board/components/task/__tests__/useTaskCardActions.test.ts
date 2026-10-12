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

  it("handleDelete stoppe la propagation, joue l'animation et appelle onDelete après animationend", () => {
    const onDelete = vi.fn();
    const onOpenDetail = vi.fn();
    const task = makeTask({ id: "to-del" });

    // Crée un faux élément carte pour vérifier l'ajout de classe
    const fakeCard = document.createElement("div");
    fakeCard.setAttribute("data-task-card", "");
    document.body.appendChild(fakeCard);

    const stopPropagation = vi.fn();
    const fakeEvent = {
      stopPropagation,
      currentTarget: {
        closest: vi.fn((sel: string) =>
          sel === "[data-task-card]" ? fakeCard : null,
        ),
      },
    } as unknown as React.MouseEvent<HTMLButtonElement>;

    const { result } = renderHook(() =>
      useTaskCardActions({ task, onDelete, onOpenDetail }),
    );

    act(() => result.current.handleDelete(fakeEvent));

    expect(stopPropagation).toHaveBeenCalledTimes(1);
    expect(fakeCard.classList.contains("task-card--deleting")).toBe(true);
    expect(onDelete).not.toHaveBeenCalled();

    // Simule la fin d'animation
    act(() => {
      fakeCard.dispatchEvent(new Event("animationend"));
    });

    expect(onDelete).toHaveBeenCalledWith("to-del");

    document.body.removeChild(fakeCard);
  });

  it("handleDelete appelle onDelete immédiatement si aucune carte parente n'est trouvée", () => {
    const onDelete = vi.fn();
    const task = makeTask({ id: "orphan" });

    const stopPropagation = vi.fn();
    const fakeEvent = {
      stopPropagation,
      currentTarget: {
        closest: vi.fn(() => null),
      },
    } as unknown as React.MouseEvent<HTMLButtonElement>;

    const { result } = renderHook(() => useTaskCardActions({ task, onDelete }));

    act(() => result.current.handleDelete(fakeEvent));

    expect(stopPropagation).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledWith("orphan");
  });
});
