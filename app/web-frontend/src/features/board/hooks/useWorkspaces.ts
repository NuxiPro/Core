import { useQuery } from "@tanstack/react-query";
import { getWorkspaces } from "../api/workspaces";

/* Workspaces mis en cache */
export function useWorkspaces() {
  const { data: workspaces = [], isLoading } = useQuery({
    queryKey: ["workspaces"],
    queryFn: getWorkspaces,
    // Workspaces rarely change — cache 10 min, keep 30 min
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  return { workspaces, isLoading };
}
