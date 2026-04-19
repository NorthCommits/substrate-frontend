"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Check, Copy } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Section {
  id: string;
  label: string;
}

const sections: Section[] = [
  { id: "overview", label: "Overview" },
  { id: "authentication", label: "Authentication" },
  { id: "agents", label: "Agents" },
  { id: "context", label: "Context" },
  { id: "subscriptions", label: "Subscriptions" },
  { id: "graph", label: "Graph" },
  { id: "directory", label: "Directory" },
  { id: "health", label: "Health" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function MethodBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    GET: "bg-emerald-100 text-emerald-700",
    POST: "bg-indigo-100 text-indigo-700",
    PATCH: "bg-amber-100 text-amber-700",
    DELETE: "bg-red-100 text-red-700",
  };
  return (
    <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded font-mono ${colors[method] ?? "bg-slate-100 text-slate-700"}`}>
      {method}
    </span>
  );
}

function AuthBadge({ type }: { type: "jwt" | "apikey" | "none" }) {
  if (type === "none") return null;
  return (
    <span className={`inline-block text-xs px-2 py-0.5 rounded-full border ${
      type === "jwt"
        ? "bg-violet-50 text-violet-700 border-violet-200"
        : "bg-blue-50 text-blue-700 border-blue-200"
    }`}>
      {type === "jwt" ? "Bearer JWT" : "X-API-Key"}
    </span>
  );
}

function CodeBlock({ code, language = "json" }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(code.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="relative group mt-3 mb-4">
      <pre className={`bg-slate-900 text-slate-100 rounded-lg p-4 text-xs overflow-x-auto font-mono leading-relaxed language-${language}`}>
        <code>{code.trim()}</code>
      </pre>
      <button
        onClick={copy}
        className="absolute top-3 right-3 text-slate-400 hover:text-slate-100 opacity-0 group-hover:opacity-100 transition-all"
        aria-label="Copy code"
      >
        {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  );
}

function Endpoint({
  method,
  path,
  auth,
  description,
  requestBody,
  response,
  params,
}: {
  method: string;
  path: string;
  auth: "jwt" | "apikey" | "none";
  description: string;
  requestBody?: string;
  response?: string;
  params?: { name: string; type: string; required?: boolean; description: string }[];
}) {
  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden mb-4">
      <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border-b border-slate-200">
        <MethodBadge method={method} />
        <code className="text-sm text-slate-800 font-mono flex-1">{path}</code>
        <AuthBadge type={auth} />
      </div>
      <div className="px-4 py-3 space-y-3">
        <p className="text-sm text-slate-600">{description}</p>
        {params && params.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Parameters</p>
            <div className="space-y-1.5">
              {params.map((p) => (
                <div key={p.name} className="flex items-start gap-2 text-sm">
                  <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-700 flex-shrink-0">{p.name}</code>
                  <span className="text-xs text-slate-400 flex-shrink-0">{p.type}{p.required ? " · required" : " · optional"}</span>
                  <span className="text-xs text-slate-500">{p.description}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {requestBody && (
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Request Body</p>
            <CodeBlock code={requestBody} />
          </div>
        )}
        {response && (
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Response</p>
            <CodeBlock code={response} />
          </div>
        )}
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xl font-bold text-slate-900 mb-1">{children}</h2>;
}

function SectionSubtitle({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-slate-500 mb-6">{children}</p>;
}

function Divider() {
  return <hr className="border-slate-100 my-8" />;
}

// ─── Content sections ─────────────────────────────────────────────────────────

function OverviewSection() {
  return (
    <div>
      <SectionTitle>Overview</SectionTitle>
      <SectionSubtitle>Substrate is a context and memory bus for multi-agent AI systems.</SectionSubtitle>
      <div className="bg-indigo-50 border border-indigo-100 rounded-lg px-5 py-4 mb-6">
        <p className="text-sm font-semibold text-indigo-900 mb-1">Base URL</p>
        <code className="text-sm font-mono text-indigo-700">https://substrate-backend.onrender.com</code>
      </div>
      <p className="text-sm text-slate-600 mb-4 leading-relaxed">
        All responses are JSON. All request bodies must be <code className="text-xs bg-slate-100 px-1 rounded">application/json</code>.
        Timestamps are ISO 8601 (UTC). Paginated endpoints return arrays.
      </p>
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: "Agents", desc: "Register AI agents that produce or consume context" },
          { label: "Context", desc: "Publish, query, and track the state of shared memory" },
          { label: "Subscriptions", desc: "Subscribe agents to context types from specific producers" },
          { label: "Graph", desc: "Get a live topology of the agent + context network" },
        ].map((item) => (
          <div key={item.label} className="bg-white border border-slate-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-slate-900 mb-1">{item.label}</p>
            <p className="text-xs text-slate-500">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function AuthenticationSection() {
  return (
    <div>
      <SectionTitle>Authentication</SectionTitle>
      <SectionSubtitle>Two authentication schemes are supported depending on the endpoint.</SectionSubtitle>

      <div className="space-y-4 mb-6">
        <div className="border border-slate-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">Bearer JWT</span>
            <span className="text-xs text-slate-500">for user-level endpoints</span>
          </div>
          <p className="text-sm text-slate-600 mb-2">Obtain a token by registering or logging in. Pass it in the <code className="text-xs bg-slate-100 px-1 rounded">Authorization</code> header.</p>
          <CodeBlock code={`Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`} language="http" />
        </div>
        <div className="border border-slate-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">X-API-Key</span>
            <span className="text-xs text-slate-500">for agent operations</span>
          </div>
          <p className="text-sm text-slate-600 mb-2">Create API keys in Settings. Pass the raw key in the <code className="text-xs bg-slate-100 px-1 rounded">X-API-Key</code> header.</p>
          <CodeBlock code={`X-API-Key: sk_live_abc123...`} language="http" />
        </div>
      </div>

      <Endpoint
        method="POST"
        path="/auth/register"
        auth="none"
        description="Register a new user account. Returns a JWT access token."
        requestBody={`{
  "email": "agent@example.com",
  "password": "your-password",
  "full_name": "Ada Lovelace"
}`}
        response={`{
  "access_token": "eyJ...",
  "token_type": "bearer",
  "user": { "id": "usr_...", "email": "agent@example.com" }
}`}
      />
      <Endpoint
        method="POST"
        path="/auth/login"
        auth="none"
        description="Log in with email and password. Returns a JWT access token."
        requestBody={`{
  "email": "agent@example.com",
  "password": "your-password"
}`}
        response={`{
  "access_token": "eyJ...",
  "token_type": "bearer"
}`}
      />
      <Endpoint
        method="GET"
        path="/auth/me"
        auth="jwt"
        description="Returns the currently authenticated user's profile."
        response={`{
  "id": "usr_abc",
  "email": "agent@example.com",
  "full_name": "Ada Lovelace"
}`}
      />

      <Divider />
      <p className="text-sm font-semibold text-slate-900 mb-3">API Keys</p>
      <Endpoint
        method="GET"
        path="/api-keys/"
        auth="jwt"
        description="List all API keys for the authenticated user."
        response={`[
  {
    "id": "key_abc",
    "name": "Production Key",
    "prefix": "sk_live_",
    "is_active": true,
    "last_used_at": "2026-04-18T10:00:00Z",
    "created_at": "2026-03-01T00:00:00Z"
  }
]`}
      />
      <Endpoint
        method="POST"
        path="/api-keys/"
        auth="jwt"
        description="Create a new API key. The raw key is returned only once — store it immediately."
        requestBody={`{ "name": "Demo Key" }`}
        response={`{
  "id": "key_abc",
  "name": "Demo Key",
  "prefix": "sk_live_",
  "key": "sk_live_abc123...",
  "is_active": true,
  "created_at": "2026-04-19T00:00:00Z"
}`}
      />
      <Endpoint
        method="DELETE"
        path="/api-keys/{id}"
        auth="jwt"
        description="Revoke an API key by ID. Returns 204 No Content."
      />
    </div>
  );
}

function AgentsSection() {
  return (
    <div>
      <SectionTitle>Agents</SectionTitle>
      <SectionSubtitle>Agents are the producers and consumers of context in the system.</SectionSubtitle>

      <Endpoint
        method="GET"
        path="/agents/"
        auth="apikey"
        description="List all agents in the workspace."
        response={`[
  {
    "id": "agt_abc",
    "name": "Translation Agent",
    "description": "Handles multilingual translation",
    "is_active": true,
    "created_at": "2026-04-01T00:00:00Z",
    "updated_at": "2026-04-01T00:00:00Z"
  }
]`}
      />
      <Endpoint
        method="POST"
        path="/agents/"
        auth="apikey"
        description="Register a new agent."
        requestBody={`{
  "name": "Translation Agent",
  "description": "Handles multilingual document translation across 50+ languages"
}`}
        response={`{
  "id": "agt_abc",
  "name": "Translation Agent",
  "description": "Handles multilingual document translation across 50+ languages",
  "is_active": true,
  "created_at": "2026-04-19T00:00:00Z",
  "updated_at": "2026-04-19T00:00:00Z"
}`}
      />
      <Endpoint
        method="GET"
        path="/agents/{id}"
        auth="apikey"
        description="Get a single agent by ID."
      />
      <Endpoint
        method="PATCH"
        path="/agents/{id}"
        auth="apikey"
        description="Update an agent's description or active status."
        requestBody={`{
  "description": "Updated description",
  "is_active": false
}`}
      />
      <Endpoint
        method="DELETE"
        path="/agents/{id}"
        auth="apikey"
        description="Delete an agent and all associated context and subscriptions. Returns 204."
      />
    </div>
  );
}

function ContextSection() {
  return (
    <div>
      <SectionTitle>Context</SectionTitle>
      <SectionSubtitle>Context is the shared memory published by agents and consumed by the network.</SectionSubtitle>

      <Endpoint
        method="GET"
        path="/context/"
        auth="none"
        description="List context entries, with optional filters."
        params={[
          { name: "context_type", type: "string", description: "Filter by context type" },
          { name: "status", type: "active | stale | conflicting", description: "Filter by status" },
          { name: "producer_id", type: "string", description: "Filter by producing agent" },
        ]}
        response={`[
  {
    "id": "ctx_abc",
    "key": "biktarvy_spanish_translation",
    "context_type": "translation_output",
    "status": "active",
    "producer_id": "agt_abc",
    "created_at": "2026-04-19T00:00:00Z"
  }
]`}
      />
      <Endpoint
        method="POST"
        path="/context/publish"
        auth="apikey"
        description="Publish a new context entry. The agent_id query param must match the producer_id in the body."
        params={[
          { name: "agent_id", type: "string", required: true, description: "ID of the publishing agent (query param)" },
        ]}
        requestBody={`{
  "key": "biktarvy_spanish_translation",
  "value": {
    "source_language": "en",
    "target_language": "es",
    "confidence_score": 0.97,
    "status": "completed"
  },
  "context_type": "translation_output",
  "producer_id": "agt_abc"
}`}
        response={`{
  "id": "ctx_abc",
  "key": "biktarvy_spanish_translation",
  "value": { ... },
  "context_type": "translation_output",
  "status": "active",
  "producer_id": "agt_abc",
  "producer": { "id": "agt_abc", "name": "Translation Agent", "is_active": true },
  "created_at": "2026-04-19T00:00:00Z",
  "updated_at": "2026-04-19T00:00:00Z"
}`}
      />
      <Endpoint
        method="GET"
        path="/context/{id}"
        auth="none"
        description="Get full context details including the value payload and producer."
      />
      <Endpoint
        method="PATCH"
        path="/context/{id}/status"
        auth="apikey"
        description="Update the status of a context entry. Logs a lineage event."
        params={[
          { name: "agent_id", type: "string", required: true, description: "ID of the acting agent (query param)" },
        ]}
        requestBody={`{ "status": "stale" }`}
      />
      <Endpoint
        method="GET"
        path="/context/{id}/lineage"
        auth="none"
        description="Get the full lineage event log for a context entry."
        response={`[
  {
    "id": "evt_abc",
    "context_id": "ctx_abc",
    "agent_id": "agt_abc",
    "action": "published",
    "snapshot": { ... },
    "note": null,
    "created_at": "2026-04-19T00:00:00Z",
    "agent": { "id": "agt_abc", "name": "Translation Agent", "is_active": true }
  }
]`}
      />
      <Endpoint
        method="GET"
        path="/context/search"
        auth="none"
        description="Semantic similarity search over context values using embeddings."
        params={[
          { name: "query", type: "string", required: true, description: "Natural language search query" },
          { name: "threshold", type: "float", description: "Minimum similarity score (default 0.75)" },
          { name: "top_k", type: "integer", description: "Max results to return (default 5)" },
        ]}
      />
    </div>
  );
}

function SubscriptionsSection() {
  return (
    <div>
      <SectionTitle>Subscriptions</SectionTitle>
      <SectionSubtitle>Subscriptions declare which agents receive context from which producers.</SectionSubtitle>

      <Endpoint
        method="POST"
        path="/subscriptions/"
        auth="apikey"
        description="Create a subscription for an agent to a context type, optionally filtered to a specific producer."
        requestBody={`{
  "agent_id": "agt_consumer",
  "context_type": "translation_output",
  "producer_id": "agt_translation"
}`}
        response={`{
  "id": "sub_abc",
  "agent_id": "agt_consumer",
  "context_type": "translation_output",
  "producer_id": "agt_translation",
  "is_active": true,
  "created_at": "2026-04-19T00:00:00Z",
  "agent": { "id": "agt_consumer", "name": "RAG Agent", "is_active": true }
}`}
      />
      <Endpoint
        method="GET"
        path="/subscriptions/agent/{agent_id}"
        auth="none"
        description="List all subscriptions for a given agent."
      />
      <Endpoint
        method="DELETE"
        path="/subscriptions/{id}"
        auth="none"
        description="Delete a subscription. Returns 204 No Content."
      />
    </div>
  );
}

function GraphSection() {
  return (
    <div>
      <SectionTitle>Graph</SectionTitle>
      <SectionSubtitle>The graph API returns a live topology of agents, context, and their relationships.</SectionSubtitle>

      <Endpoint
        method="GET"
        path="/graph/"
        auth="jwt"
        description="Get the full agent-context graph for the authenticated workspace."
        response={`{
  "nodes": [
    { "id": "agt_abc", "type": "agent", "data": { "name": "Translation Agent", "is_active": true } },
    { "id": "ctx_xyz", "type": "context", "data": { "key": "biktarvy_es", "context_type": "translation_output", "status": "active" } }
  ],
  "edges": [
    { "source": "agt_abc", "target": "ctx_xyz", "type": "produces" },
    { "source": "ctx_xyz", "target": "agt_rag", "type": "subscribes" }
  ]
}`}
      />
      <Endpoint
        method="GET"
        path="/graph/public"
        auth="none"
        description="Get aggregate stats across all public workspaces."
        response={`{
  "total_public_agents": 42,
  "total_public_contexts": 187,
  "active_subscriptions": 93
}`}
      />
    </div>
  );
}

function DirectorySection() {
  return (
    <div>
      <SectionTitle>Directory</SectionTitle>
      <SectionSubtitle>The public directory lists agents and context from public workspaces.</SectionSubtitle>
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 text-center">
        <p className="text-sm text-slate-500">Directory endpoints are coming soon.</p>
        <p className="text-xs text-slate-400 mt-1">Use <code className="bg-slate-200 px-1 rounded">/graph/public</code> for aggregate stats in the meantime.</p>
      </div>
    </div>
  );
}

function HealthSection() {
  return (
    <div>
      <SectionTitle>Health</SectionTitle>
      <SectionSubtitle>Use these endpoints to check system availability.</SectionSubtitle>

      <Endpoint
        method="GET"
        path="/health/"
        auth="none"
        description="Returns overall system health including database connectivity."
        response={`{ "status": "ok", "database": "connected" }`}
      />
      <Endpoint
        method="GET"
        path="/health/redis"
        auth="none"
        description="Returns Redis connectivity status."
        response={`{ "status": "ok", "redis": "connected" }`}
      />
    </div>
  );
}

const sectionComponents: Record<string, React.ReactNode> = {
  overview: <OverviewSection />,
  authentication: <AuthenticationSection />,
  agents: <AgentsSection />,
  context: <ContextSection />,
  subscriptions: <SubscriptionsSection />,
  graph: <GraphSection />,
  directory: <DirectorySection />,
  health: <HealthSection />,
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DocsPage() {
  const [active, setActive] = useState("overview");
  const contentRef = useRef<HTMLDivElement>(null);

  function scrollToSection(id: string) {
    setActive(id);
    const el = document.getElementById(`section-${id}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id.replace("section-", ""));
          }
        }
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 }
    );

    sections.forEach(({ id }) => {
      const el2 = document.getElementById(`section-${id}`);
      if (el2) observer.observe(el2);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <div className="border-b border-slate-100 h-14 flex items-center px-6 sticky top-0 z-40 bg-white/90 backdrop-blur">
        <Link href="/" className="flex items-center gap-2 mr-8">
          <span className="h-4 w-4 bg-indigo-600 rounded flex-shrink-0" />
          <span className="font-bold text-slate-900 tracking-tight">Substrate</span>
        </Link>
        <span className="text-sm text-slate-400">API Documentation</span>
        <div className="flex-1" />
        <a
          href="https://substrate-backend.onrender.com/docs"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-slate-500 hover:text-slate-800 transition-colors"
        >
          Interactive Swagger UI →
        </a>
      </div>

      <div className="flex max-w-6xl mx-auto">
        {/* Sidebar */}
        <nav className="w-56 flex-shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto py-8 px-4 border-r border-slate-100">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3 px-2">Reference</p>
          <ul className="space-y-0.5">
            {sections.map(({ id, label }) => (
              <li key={id}>
                <button
                  onClick={() => scrollToSection(id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
                    active === id
                      ? "bg-indigo-50 text-indigo-600 font-medium"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Content */}
        <main ref={contentRef} className="flex-1 py-10 px-10 max-w-3xl">
          {sections.map(({ id }, i) => (
            <div key={id} id={`section-${id}`} className={i > 0 ? "pt-16" : ""}>
              {sectionComponents[id]}
              {i < sections.length - 1 && <Divider />}
            </div>
          ))}
          <div className="py-16 text-center">
            <p className="text-xs text-slate-300">Built with FastAPI · OpenAPI 3.1</p>
          </div>
        </main>
      </div>
    </div>
  );
}
