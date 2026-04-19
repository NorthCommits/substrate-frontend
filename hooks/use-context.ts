import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, ContextPublish, ContextStatus, ContextStatusUpdate } from "@/lib/api";

export function useContextList(params?: {
  context_type?: string;
  status?: ContextStatus;
  producer_id?: string;
}) {
  return useQuery({
    queryKey: ["context", params],
    queryFn: () => api.context.list(params),
  });
}

export function useContextSearch(query: string) {
  return useQuery({
    queryKey: ["context", "search", query],
    queryFn: () => api.context.search(query),
    enabled: query.length > 0,
  });
}

export function useContextItem(id: string) {
  return useQuery({
    queryKey: ["context", id],
    queryFn: () => api.context.get(id),
    enabled: !!id,
  });
}

export function usePublishContext() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: ContextPublish) => api.context.publish(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["context"] }),
  });
}

export function useUpdateContextStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      agentId,
      body,
    }: {
      id: string;
      agentId: string;
      body: ContextStatusUpdate;
    }) => api.context.updateStatus(id, agentId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["context"] }),
  });
}

export function useLineage(id: string) {
  return useQuery({
    queryKey: ["lineage", id],
    queryFn: () => api.context.lineage(id),
    enabled: !!id,
  });
}
