import type { Workspace } from "@packages/shared/types/workspace";
import { createContext, useContext, useEffect, useState } from "react";
import { SELECTED_WORKSPACE_STORAGE_KEY } from "./constants";
import { useWorkspaces } from "./hooks/useWorkspaces";

type WorkspaceSelectionContextValue = {
  currentWorkspace: Workspace | undefined;
  workspaces: Workspace[];
  workspacesLoading: boolean;
  workspacesError: boolean;
  selectWorkspace: (workspaceId: string) => void;
};

const WorkspaceSelectionContext =
  createContext<WorkspaceSelectionContextValue | null>(null);

function readStoredWorkspaceId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(SELECTED_WORKSPACE_STORAGE_KEY);
}

export function WorkspaceSelectionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { workspaces, isLoading, isError } = useWorkspaces();
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(
    readStoredWorkspaceId,
  );
  const currentWorkspace =
    workspaces.find((workspace) => workspace.id === selectedWorkspaceId) ??
    workspaces[0];

  useEffect(() => {
    if (!currentWorkspace || currentWorkspace.id === selectedWorkspaceId)
      return;

    setSelectedWorkspaceId(currentWorkspace.id);
    window.localStorage.setItem(
      SELECTED_WORKSPACE_STORAGE_KEY,
      currentWorkspace.id,
    );
  }, [currentWorkspace, selectedWorkspaceId]);

  const selectWorkspace = (workspaceId: string) => {
    setSelectedWorkspaceId(workspaceId);
    window.localStorage.setItem(SELECTED_WORKSPACE_STORAGE_KEY, workspaceId);
  };

  return (
    <WorkspaceSelectionContext.Provider
      value={{
        currentWorkspace,
        workspaces,
        workspacesLoading: isLoading,
        workspacesError: isError,
        selectWorkspace,
      }}
    >
      {children}
    </WorkspaceSelectionContext.Provider>
  );
}

export function useWorkspaceSelection() {
  const context = useContext(WorkspaceSelectionContext);
  if (!context) {
    throw new Error(
      "useWorkspaceSelection must be used within WorkspaceSelectionProvider",
    );
  }
  return context;
}
