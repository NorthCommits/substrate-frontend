import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useGraph() {
  return useQuery({
    queryKey: ["graph"],
    queryFn: () => {
      const token = typeof window !== "undefined"
        ? localStorage.getItem("substrate_token") ?? undefined
        : undefined;
      return api.graph.get(token);
    },
    refetchInterval: 15000,
    staleTime: 10000,
  });
}
