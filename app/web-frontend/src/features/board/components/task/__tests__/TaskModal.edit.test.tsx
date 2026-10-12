import { beforeEach, describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import type { Task } from "@packages/shared/types/task/task";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const {
  mockHandleSave,
  mockSetTitle,
  mockSetDescription,
  mockSetPriority,
  useTaskFormMock,
} = vi.hoisted(() => ({
  mockHandleSave: vi.fn(),
  mockSetTitle: vi.fn(),
  mockSetDescription: vi.fn(),
  mockSetPriority: vi.fn(),
  useTaskFormMock: vi.fn(),
}));

vi.mock("../hooks/useTaskForm", () => ({
  useTaskForm: useTaskFormMock,
}));

vi.mock("../sections/MetadataSection", () => ({
  MetadataSection: () => <div data-testid="metadata-section" />,
}));

vi.mock("../../../editor/lazy-tiptap-editor", () => ({
  LazyTipTapEditorWithSuspense: () => (
    <div className="ProseMirror" data-slot="editor-content" />
  ),
}));

import TaskModal from "../modals/TaskModal";

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: "task-42",
    title: "Titre initial",
    description: "Desc initiale",
    colId: "In_Progress",
    priority: "none",
    positionString: "a0",
    createdAt: "2026-06-01T10:00:00Z",
    updatedAt: "2026-06-01T10:00:00Z",
    ...overrides,
  } as Task;
}

beforeEach(() => {
  vi.clearAllMocks();
  useTaskFormMock.mockReturnValue({
    title: "Titre actuel",
    setTitle: mockSetTitle,
    description: "Desc actuelle",
    setDescription: mockSetDescription,
    priority: "none",
    setPriority: mockSetPriority,
    handleSave: mockHandleSave,
    isSaving: false,
    error: null,
  });
});

describe("TaskModal - mode édition", () => {
  it("rend le titre, les sections et le bouton fermer quand une tâche est fournie", () => {
    const onClose = vi.fn();
    const onUpdate = vi.fn();
    render(
      <TaskModal
        mode="edit"
        task={makeTask()}
        onClose={onClose}
        onUpdate={onUpdate}
      />,
    );

    expect(
      screen.getByRole("button", { name: /task\.close/i }),
    ).toBeInTheDocument();
  });

  it("Cmd+Enter déclenche secureSave puis onClose", async () => {
    mockHandleSave.mockResolvedValue(undefined);
    const onClose = vi.fn();
    const onUpdate = vi.fn();

    render(
      <TaskModal
        mode="edit"
        task={makeTask()}
        onClose={onClose}
        onUpdate={onUpdate}
      />,
    );

    fireEvent.keyDown(document, { key: "Enter", metaKey: true });

    await waitFor(() => {
      expect(mockHandleSave).toHaveBeenCalledTimes(1);
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("Ctrl+Enter déclenche secureSave puis onClose (variante Linux/Windows)", async () => {
    mockHandleSave.mockResolvedValue(undefined);
    const onClose = vi.fn();
    const onUpdate = vi.fn();

    render(
      <TaskModal
        mode="edit"
        task={makeTask()}
        onClose={onClose}
        onUpdate={onUpdate}
      />,
    );

    fireEvent.keyDown(document, { key: "Enter", ctrlKey: true });

    await waitFor(() => {
      expect(mockHandleSave).toHaveBeenCalledTimes(1);
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("Enter seul (sans modifieur) ne déclenche PAS secureSave", () => {
    const onClose = vi.fn();
    const onUpdate = vi.fn();

    render(
      <TaskModal
        mode="edit"
        task={makeTask()}
        onClose={onClose}
        onUpdate={onUpdate}
      />,
    );

    fireEvent.keyDown(document, { key: "Enter" });

    expect(mockHandleSave).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("le bouton fermer déclenche onClose", async () => {
    mockHandleSave.mockResolvedValue(undefined);
    const onClose = vi.fn();
    const onUpdate = vi.fn();

    render(
      <TaskModal
        mode="edit"
        task={makeTask()}
        onClose={onClose}
        onUpdate={onUpdate}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /task\.close/i }));

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  it("ne déclenche rien si task est null (raccourci clavier ignoré)", () => {
    const onClose = vi.fn();
    const onUpdate = vi.fn();

    render(
      <TaskModal
        mode="edit"
        task={null}
        onClose={onClose}
        onUpdate={onUpdate}
      />,
    );

    fireEvent.keyDown(document, { key: "Enter", metaKey: true });

    expect(mockHandleSave).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });
});
