const BASE_URL = "https://substrate-backend.onrender.com";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ContextStatus = "active" | "stale" | "conflicting";

export interface AgentSummary {
  id: string;
  name: string;
  is_active: boolean;
}

export interface AgentResponse {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AgentCreate {
  name: string;
  description?: string | null;
}

export interface AgentUpdate {
  description?: string | null;
  is_active?: boolean | null;
}

export interface ContextSummary {
  id: string;
  key: string;
  context_type: string;
  status: ContextStatus;
  producer_id: string;
  created_at: string;
}

export interface ContextResponse {
  id: string;
  key: string;
  value: Record<string, unknown>;
  context_type: string;
  status: ContextStatus;
  producer_id: string;
  producer: AgentSummary;
  created_at: string;
  updated_at: string;
}

export interface ContextPublish {
  key: string;
  value: Record<string, unknown>;
  context_type: string;
  producer_id: string;
}

export interface ContextStatusUpdate {
  status: ContextStatus;
}

export interface LineageResponse {
  id: string;
  context_id: string;
  agent_id: string;
  action: string;
  snapshot: Record<string, unknown> | null;
  note: string | null;
  created_at: string;
  agent: AgentSummary;
}

export interface SubscriptionCreate {
  agent_id: string;
  context_type: string;
  producer_id?: string | null;
}

export interface SubscriptionResponse {
  id: string;
  agent_id: string;
  context_type: string;
  producer_id: string | null;
  is_active: boolean;
  created_at: string;
  agent: AgentSummary;
}

export interface GraphNode {
  id: string;
  type: "agent" | "context";
  data: Record<string, unknown>;
}

export interface GraphEdge {
  source: string;
  target: string;
  type: "produces" | "subscribes";
}

export interface GraphResponse {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface HealthResponse {
  status: string;
  database?: string;
  [key: string]: unknown;
}

export interface AuthRegister {
  email: string;
  password: string;
  full_name?: string | null;
}

export interface AuthLogin {
  email: string;
  password: string;
}

export interface PublicGraphSummary {
  total_public_agents: number;
  total_public_contexts: number;
  active_subscriptions?: number;
}

// ─── Fetch helper ─────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const { headers: extraHeaders, ...restInit } = init ?? {};
  const res = await fetch(`${BASE_URL}${path}`, {
    ...restInit,
    headers: { "Content-Type": "application/json", ...(extraHeaders as Record<string, string> | undefined) },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "Unknown error");
    throw new Error(`${res.status}: ${text}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// ─── Health ───────────────────────────────────────────────────────────────────

// ─── API Key types ────────────────────────────────────────────────────────────

export interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  is_active: boolean;
  last_used_at: string | null;
  created_at: string;
}

export interface ApiKeyCreated extends ApiKey {
  key: string;
}

export interface WorkspaceResponse {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  owner_id: string;
  created_at: string;
}

export interface WorkspaceUpdate {
  name?: string;
  description?: string | null;
}

// ─── Auth header helpers ───────────────────────────────────────────────────────

export function bearerHeaders(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` };
}

export function apiKeyHeaders(apiKey: string): Record<string, string> {
  return { "X-API-Key": apiKey };
}

export const api = {
  health: {
    get: () => apiFetch<HealthResponse>("/health/"),
    redis: () => apiFetch<HealthResponse>("/health/redis"),
  },

  // ─── Agents ─────────────────────────────────────────────────────────────────

  agents: {
    list: (apiKey?: string) =>
      apiFetch<AgentResponse[]>("/agents/", apiKey ? { headers: { "X-API-Key": apiKey } } : undefined),
    get: (id: string, apiKey?: string) =>
      apiFetch<AgentResponse>(`/agents/${id}`, apiKey ? { headers: { "X-API-Key": apiKey } } : undefined),
    create: (body: AgentCreate, apiKey?: string) =>
      apiFetch<AgentResponse>("/agents/", {
        method: "POST",
        body: JSON.stringify(body),
        headers: apiKey ? { "X-API-Key": apiKey } : undefined,
      }),
    update: (id: string, body: AgentUpdate, apiKey?: string) =>
      apiFetch<AgentResponse>(`/agents/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
        headers: apiKey ? { "X-API-Key": apiKey } : undefined,
      }),
    delete: (id: string, apiKey?: string) =>
      apiFetch<void>(`/agents/${id}`, {
        method: "DELETE",
        headers: apiKey ? { "X-API-Key": apiKey } : undefined,
      }),
  },

  // ─── Context ─────────────────────────────────────────────────────────────────

  context: {
    list: (params?: {
      context_type?: string;
      status?: ContextStatus;
      producer_id?: string;
    }) => {
      const q = new URLSearchParams();
      if (params?.context_type) q.set("context_type", params.context_type);
      if (params?.status) q.set("status", params.status);
      if (params?.producer_id) q.set("producer_id", params.producer_id);
      const qs = q.toString();
      return apiFetch<ContextSummary[]>(`/context/${qs ? `?${qs}` : ""}`);
    },
    search: (query: string, threshold = 0.75, top_k = 5) => {
      const q = new URLSearchParams({ query, threshold: String(threshold), top_k: String(top_k) });
      return apiFetch<ContextSummary[]>(`/context/search?${q}`);
    },
    get: (id: string) => apiFetch<ContextResponse>(`/context/${id}`),
    publish: (body: ContextPublish, apiKey?: string) =>
      apiFetch<ContextResponse>(
        `/context/publish?agent_id=${body.producer_id}`,
        {
          method: "POST",
          body: JSON.stringify(body),
          headers: apiKey ? { "X-API-Key": apiKey } : undefined,
        }
      ),
    updateStatus: (id: string, agentId: string, body: ContextStatusUpdate, apiKey?: string) =>
      apiFetch<ContextResponse>(`/context/${id}/status?agent_id=${agentId}`, {
        method: "PATCH",
        body: JSON.stringify(body),
        headers: apiKey ? { "X-API-Key": apiKey } : undefined,
      }),
    lineage: (id: string, apiKey?: string) =>
      apiFetch<LineageResponse[]>(
        `/context/${id}/lineage`,
        apiKey ? { headers: { "X-API-Key": apiKey } } : undefined
      ),
  },

  // ─── Graph ───────────────────────────────────────────────────────────────────

  graph: {
    get: (token?: string) =>
      apiFetch<GraphResponse>(
        "/graph/",
        token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
      ),
    publicStats: () => apiFetch<PublicGraphSummary>("/graph/public"),
  },

  // ─── Auth ────────────────────────────────────────────────────────────────────

  auth: {
    register: (body: AuthRegister) =>
      apiFetch<{ access_token: string; token_type: string; user: unknown }>("/auth/register", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    login: (body: AuthLogin) =>
      apiFetch<{ access_token: string; token_type: string; user: unknown }>("/auth/login", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    me: (token: string) =>
      apiFetch<unknown>("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      }),
  },

  // ─── API Keys ─────────────────────────────────────────────────────────────────

  apiKeys: {
    list: (token: string) =>
      apiFetch<ApiKey[]>("/api-keys/", { headers: bearerHeaders(token) }),
    create: (token: string, body: { name: string }) =>
      apiFetch<ApiKeyCreated>("/api-keys/", {
        method: "POST",
        body: JSON.stringify(body),
        headers: bearerHeaders(token),
      }),
    delete: (token: string, id: string) =>
      apiFetch<void>(`/api-keys/${id}`, { method: "DELETE", headers: bearerHeaders(token) }),
  },

  // ─── Workspace ────────────────────────────────────────────────────────────────

  workspace: {
    me: (token: string) =>
      apiFetch<WorkspaceResponse>("/workspaces/me", { headers: bearerHeaders(token) }),
    update: (token: string, body: WorkspaceUpdate) =>
      apiFetch<WorkspaceResponse>("/workspaces/me", {
        method: "PATCH",
        body: JSON.stringify(body),
        headers: bearerHeaders(token),
      }),
  },

  // ─── Auth/me ──────────────────────────────────────────────────────────────────

  user: {
    me: (token: string) =>
      apiFetch<unknown>("/auth/me", { headers: bearerHeaders(token) }),
  },

  // ─── Subscriptions ───────────────────────────────────────────────────────────

  subscriptions: {
    create: (body: SubscriptionCreate, apiKey?: string) =>
      apiFetch<SubscriptionResponse>("/subscriptions/", {
        method: "POST",
        body: JSON.stringify(body),
        headers: apiKey ? { "X-API-Key": apiKey } : undefined,
      }),
    forAgent: (agentId: string) =>
      apiFetch<SubscriptionResponse[]>(`/subscriptions/agent/${agentId}`),
    delete: (id: string) =>
      apiFetch<void>(`/subscriptions/${id}`, { method: "DELETE" }),
  },
};
