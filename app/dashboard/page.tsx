"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Bot, Database, Bell, Globe, AlertTriangle, Loader2, Network } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth";
import { useAgents } from "@/hooks/use-agents";
import { useContextList } from "@/hooks/use-context";
import { useApiKeys } from "@/hooks/useApiKeys";
import { Badge, StatusDot } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatRelativeTime } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { seedDemoData, getOrCreateApiKey } from "@/lib/seed";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function useCountUp(target: number, duration = 800) {
  const [value, setValue] = useState(0);
  const ref = useRef(false);
  useEffect(() => {
    if (target === 0 || ref.current) return;
    ref.current = true;
    const start = Date.now();
    const tick = () => {
      const p = Math.min((Date.now() - start) / duration, 1);
      setValue(Math.round((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return value;
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  delta,
  index,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  delta?: React.ReactNode;
  index: number;
}) {
  const count = useCountUp(value);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="bg-white rounded-lg border border-slate-200 p-5 hover:shadow-sm transition-all duration-200"
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-xs text-slate-500 font-medium">{label}</p>
          <p className="text-3xl font-bold text-slate-900 tracking-tight mt-0.5">{count}</p>
          {delta && <div className="mt-1">{delta}</div>}
        </div>
      </div>
    </motion.div>
  );
}

function EmptyOnboarding() {
  const router = useRouter();
  const qc = useQueryClient();
  const [seeding, setSeeding] = useState(false);
  const [step, setStep] = useState("");

  async function handleSeed() {
    setSeeding(true);
    setStep("Getting API key...");
    try {
      const apiKey = await getOrCreateApiKey();
      await seedDemoData(apiKey, (s) => setStep(s));
      await qc.invalidateQueries();
      toast.success("Demo data seeded successfully!");
      const confetti = (await import("canvas-confetti")).default;
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.55 }, colors: ["#6366f1", "#818cf8", "#c7d2fe"] });
      setTimeout(() => router.push("/dashboard/graph"), 1200);
    } catch {
      toast.error("Seeding failed. Please try again.");
    } finally {
      setSeeding(false);
      setStep("");
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center"
      >
        <Network className="h-20 w-20 text-slate-200 mb-6" strokeWidth={1.2} />
        <h2 className="text-2xl font-semibold text-slate-900 mb-2">Substrate is empty</h2>
        <p className="text-sm text-slate-500 max-w-sm mb-8 leading-relaxed">
          Seed the system with demo agents and context to see Substrate in action.
        </p>
        <Button size="lg" onClick={handleSeed} disabled={seeding}>
          {seeding ? <><Loader2 className="h-4 w-4 animate-spin" />{step || "Seeding..."}</> : "Seed Demo Data"}
        </Button>
        {seeding && step && (
          <p className="text-xs text-slate-400 mt-3 animate-pulse">{step}</p>
        )}
      </motion.div>
    </div>
  );
}

export default function DashboardPage() {
  const { token, user } = useAuthStore();
  const { data: agents = [], isLoading: agentsLoading } = useAgents();
  const { data: contexts = [], isLoading: ctxLoading } = useContextList();
  const { data: apiKeys = [] } = useApiKeys(token);

  const { data: subscriptions = [] } = useQuery({
    queryKey: ["subscriptions-all", agents.map((a) => a.id).join(",")],
    queryFn: async () => {
      const all = await Promise.allSettled(agents.map((a) => api.subscriptions.forAgent(a.id)));
      return all.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
    },
    enabled: agents.length > 0,
    refetchInterval: 10000,
  });

  if (!agentsLoading && agents.length === 0) return <EmptyOnboarding />;

  const activeAgents = agents.filter((a) => a.is_active).length;
  const activeContexts = contexts.filter((c) => c.status === "active").length;
  const publicContexts = contexts.filter((c) => (c as { visibility?: string }).visibility === "public").length;
  const activeSubs = subscriptions.filter((s) => s.is_active).length;
  const recentContexts = [...contexts]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const hasNoKeys = !agentsLoading && apiKeys.length === 0;

  return (
    <div>
      {/* Welcome bar */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-start justify-between mb-8"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {greeting()}{user?.full_name ? `, ${user.full_name.split(" ")[0]}` : ""}.
          </h1>
          <p className="text-slate-500 mt-1">Here&apos;s what&apos;s happening in your workspace.</p>
        </div>
        <Link href="/dashboard/graph" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors mt-1">
          View graph →
        </Link>
      </motion.div>

      {/* API key warning */}
      {hasNoKeys && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6 flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3"
        >
          <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
          <p className="text-sm text-amber-800 flex-1">
            You have no API keys. Create one to connect your agents.
          </p>
          <Link href="/dashboard/settings" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex-shrink-0">
            Create API key →
          </Link>
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Agents"
          value={agents.length}
          icon={Bot}
          color="bg-indigo-50 text-indigo-600"
          delta={<span className="text-xs text-emerald-600">{activeAgents} active</span>}
          index={0}
        />
        <StatCard
          label="Total Contexts"
          value={contexts.length}
          icon={Database}
          color="bg-violet-50 text-violet-600"
          delta={<span className="text-xs text-emerald-600">{activeContexts} active</span>}
          index={1}
        />
        <StatCard
          label="Subscriptions"
          value={activeSubs}
          icon={Bell}
          color="bg-amber-50 text-amber-600"
          index={2}
        />
        <StatCard
          label="Public Contexts"
          value={publicContexts}
          icon={Globe}
          color="bg-emerald-50 text-emerald-600"
          delta={<span className="text-xs text-slate-400">visible to all</span>}
          index={3}
        />
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
        {/* Recent Context — 60% */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="lg:col-span-3 bg-white rounded-lg border border-slate-200 overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Recent Context</h2>
          </div>
          {ctxLoading ? (
            <div className="divide-y divide-slate-50">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="px-5 py-3 animate-pulse flex gap-3">
                  <div className="h-4 bg-slate-100 rounded w-24" />
                  <div className="h-4 bg-slate-100 rounded w-20" />
                  <div className="h-4 bg-slate-100 rounded w-16 ml-auto" />
                </div>
              ))}
            </div>
          ) : recentContexts.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <Database className="h-8 w-8 text-slate-200 mx-auto mb-2" />
              <p className="text-sm text-slate-500">No context published yet</p>
              <p className="text-xs text-slate-400 mt-1">Publish your first context to get started</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {recentContexts.map((ctx) => {
                const agent = agents.find((a) => a.id === ctx.producer_id);
                return (
                  <div key={ctx.id} className="px-5 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors">
                    <span className="bg-indigo-50 text-indigo-600 rounded-full px-2 py-0.5 text-xs font-medium flex-shrink-0">
                      {ctx.context_type}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-slate-900 truncate block">{ctx.key}</span>
                      <span className="text-xs text-slate-500">{agent?.name ?? "Unknown agent"}</span>
                    </div>
                    <Badge variant={ctx.status === "active" ? "active" : ctx.status === "stale" ? "stale" : "conflicting"}>
                      <StatusDot status={ctx.status} />
                      {ctx.status}
                    </Badge>
                    <span className="text-xs text-slate-400 flex-shrink-0 w-16 text-right">
                      {formatRelativeTime(ctx.created_at)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
          <div className="px-5 py-3 border-t border-slate-50">
            <Link href="/dashboard/context" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
              View all context →
            </Link>
          </div>
        </motion.div>

        {/* Your Agents — 40% */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="lg:col-span-2 bg-white rounded-lg border border-slate-200 overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900">Your Agents</h2>
          </div>
          {agentsLoading ? (
            <div className="divide-y divide-slate-50">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="px-5 py-3 animate-pulse flex gap-2">
                  <div className="h-4 bg-slate-100 rounded-full w-4" />
                  <div className="h-4 bg-slate-100 rounded w-32" />
                </div>
              ))}
            </div>
          ) : agents.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <Bot className="h-8 w-8 text-slate-200 mx-auto mb-2" />
              <p className="text-sm text-slate-500">No agents registered</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {agents.slice(0, 5).map((agent) => (
                <div key={agent.id} className="px-5 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${agent.is_active ? "bg-emerald-500" : "bg-slate-300"}`} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{agent.name}</p>
                    <p className="text-xs text-slate-400 truncate">{agent.description ?? "No description"}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="px-5 py-3 border-t border-slate-50">
            <Link href="/dashboard/agents" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
              View all agents →
            </Link>
          </div>
        </motion.div>
      </div>

      {/* API Keys panel */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.35 }}
        className="bg-white rounded-lg border border-slate-200 overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">API Keys</h2>
          <Link href="/dashboard/settings" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
            Manage keys →
          </Link>
        </div>
        {hasNoKeys ? (
          <div className="px-5 py-5 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />
            <p className="text-sm text-amber-800 flex-1">
              You have no API keys. Create one to connect your agents.
            </p>
            <Link href="/dashboard/settings">
              <button className="text-sm border border-indigo-600 text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors">
                Create API key →
              </button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {apiKeys.slice(0, 3).map((k) => (
              <div key={k.id} className="px-5 py-3 flex items-center gap-3">
                <code className="text-xs text-slate-500 font-mono">{k.prefix}…</code>
                <span className="text-xs text-slate-900 font-medium flex-1">{k.name}</span>
                <span className="text-xs text-slate-400">
                  {k.last_used_at ? `Used ${formatRelativeTime(k.last_used_at)}` : "Never used"}
                </span>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
