import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useApiKeys(token: string | null) {
  return useQuery({
    queryKey: ["api-keys"],
    queryFn: () => api.apiKeys.list(token!),
    enabled: !!token,
    staleTime: 30_000,
  });
}

export function useCreateApiKey(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { name: string }) => api.apiKeys.create(token!, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["api-keys"] }),
  });
}

export function useDeleteApiKey(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.apiKeys.delete(token!, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["api-keys"] }),
  });
}

export function useWorkspace(token: string | null) {
  return useQuery({
    queryKey: ["workspace"],
    queryFn: () => api.workspace.me(token!),
    enabled: !!token,
    staleTime: 60_000,
  });
}
