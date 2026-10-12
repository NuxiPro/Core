import { QueryClient } from "@tanstack/react-query";

// Gestion de cache (global query client)
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000,
      gcTime: 60 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      retry: 1,
      refetchInterval: false,
    },
  },
});
