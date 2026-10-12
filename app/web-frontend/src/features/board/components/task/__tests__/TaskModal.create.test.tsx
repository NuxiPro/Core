import { beforeEach, describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import type { ColumnId } from "@packages/shared/config";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import TaskModal from "../modals/TaskModal";

const colId: ColumnId = "In_Progress";
const columnTitle = "En cours";

Object.defineProperty(document, "elementFromPoint", {
  writable: true,
  value: vi.fn(() => null),
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("TaskModal - mode création", () => {
  it("n'affiche pas la dialog quand open=false", () => {
    const onAdd = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <TaskModal
        mode="create"
        colId={colId}
        columnTitle={columnTitle}
        onAdd={onAdd}
        open={false}
        onOpenChange={onOpenChange}
      />,
    );

    expect(screen.queryByPlaceholderText("Title")).not.toBeInTheDocument();
    expect(onAdd).not.toHaveBeenCalled();
  });

  it("affiche la dialog quand open=true", async () => {
    const onAdd = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <TaskModal
        mode="create"
        colId={colId}
        columnTitle={columnTitle}
        onAdd={onAdd}
        open={true}
        onOpenChange={onOpenChange}
      />,
    );

    const titleInput = await screen.findByPlaceholderText("Title");
    expect(titleInput).toBeInTheDocument();
  });

  it("soumet via le raccourci Enter sur l'input titre", async () => {
    const onAdd = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <TaskModal
        mode="create"
        colId={colId}
        columnTitle={columnTitle}
        onAdd={onAdd}
        open={true}
        onOpenChange={onOpenChange}
      />,
    );

    const titleInput = await screen.findByPlaceholderText("Title");

    fireEvent.change(titleInput, { target: { value: "Tâche via Enter" } });
    fireEvent.keyDown(titleInput, { key: "Enter", code: "Enter" });

    await waitFor(() => {
      expect(onAdd).toHaveBeenCalledTimes(1);
    });
    expect(onAdd.mock.calls[0][0].title).toBe("Tâche via Enter");
  });
});
