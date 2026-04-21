import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useGraph() {
  return useQuery({
    queryKey: ["graph"],
    queryFn: () => api.graph.get(),
    refetchInterval: 15000,
    staleTime: 10000,
  });
}
