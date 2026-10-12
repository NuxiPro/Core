import { useQuery } from "@tanstack/react-query";
import { getProjects } from "@/src/features/board/api/projects";

export function useProjects() {
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: getProjects,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  return { projects, isLoading };
}
