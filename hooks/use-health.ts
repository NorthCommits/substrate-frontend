import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useHealth() {
  return useQuery({
    queryKey: ["health"],
    queryFn: api.health.get,
    refetchInterval: 10000,
  });
}

export function useRedisHealth() {
  return useQuery({
    queryKey: ["health", "redis"],
    queryFn: api.health.redis,
    refetchInterval: 10000,
  });
}
