"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Upload, Database, ChevronDown, ChevronRight, ExternalLink, Lock, Globe } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useContextList, useContextSearch, usePublishContext, useUpdateContextStatus, useContextItem } from "@/hooks/use-context";
import { useAgents } from "@/hooks/use-agents";
import { ContextSummary, ContextStatus } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge, StatusDot } from "@/components/ui/badge";
import { SlideOver } from "@/components/ui/slide-over";
import { formatRelativeTime } from "@/lib/utils";

const STATUS_OPTIONS: { label: string; value: ContextStatus | "" }[] = [
  { label: "All statuses", value: "" },
  { label: "Active", value: "active" },
  { label: "Stale", value: "stale" },
  { label: "Conflicting", value: "conflicting" },
];

function ContextCard({ ctx, agents }: { ctx: ContextSummary; agents: { id: string; name: string; is_active: boolean }[] }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const updateStatus = useUpdateContextStatus();
  const { data: full } = useContextItem(expanded ? ctx.id : "");
  const agent = agents.find((a) => a.id === ctx.producer_id);

  async function markStatus(status: ContextStatus) {
    if (!agent) { toast.error("Producer agent not found"); return; }
    try {
      await updateStatus.mutateAsync({ id: ctx.id, agentId: agent.id, body: { status } });
      toast.success(`Marked as ${status}`);
    } catch { toast.error("Failed to update status"); }
  }

  async function copyJson() {
    if (!full) return;
    await navigator.clipboard.writeText(JSON.stringify(full.value, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const visibility = (ctx as { visibility?: string }).visibility;

  return (
    <motion.div layout className="bg-white rounded-lg border border-slate-200 overflow-hidden hover:shadow-sm transition-all duration-200">
      <button
        className="w-full px-5 py-4 flex items-start gap-3 text-left hover:bg-slate-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded
          ? <ChevronDown className="h-4 w-4 text-slate-400 flex-shrink-0 mt-0.5" />
          : <ChevronRight className="h-4 w-4 text-slate-400 flex-shrink-0 mt-0.5" />
        }
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-indigo-50 text-indigo-600 rounded-full px-2 py-0.5 text-xs font-medium">{ctx.context_type}</span>
            {visibility === "public"
              ? <span className="bg-emerald-50 text-emerald-600 rounded-full px-2 py-0.5 text-xs flex items-center gap-1"><Globe className="h-3 w-3" />Public</span>
              : <span className="bg-slate-100 text-slate-600 rounded-full px-2 py-0.5 text-xs flex items-center gap-1"><Lock className="h-3 w-3" />Private</span>
            }
            <Badge variant={ctx.status === "active" ? "active" : ctx.status === "stale" ? "stale" : "conflicting"}>
              <StatusDot status={ctx.status} />{ctx.status}
            </Badge>
          </div>
          <p className="text-sm font-semibold text-slate-900 mt-1.5">{ctx.key}</p>
          <p className="text-xs text-slate-400 mt-0.5">
            by {agent?.name ?? "Unknown"} · {formatRelativeTime(ctx.created_at)}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 mt-0.5" onClick={(e) => e.stopPropagation()}>
          <Link href={`/dashboard/lineage/${ctx.id}`} className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
            <ExternalLink className="h-3 w-3" />Lineage
          </Link>
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-slate-100"
          >
            <div className="px-5 py-4">
              {full ? (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-500">JSON Value</span>
                    <button onClick={copyJson} className="text-xs text-indigo-600 hover:text-indigo-700">
                      {copied ? "Copied!" : "Copy JSON"}
                    </button>
                  </div>
                  <pre className="text-xs bg-slate-800 text-slate-100 rounded-lg p-4 overflow-x-auto font-mono leading-relaxed max-h-48">
                    {JSON.stringify(full.value, null, 2)}
                  </pre>
                  <div className="mt-3 flex gap-2 flex-wrap">
                    {ctx.status !== "stale" && (
                      <button onClick={() => markStatus("stale")} className="text-xs text-amber-600 border border-amber-200 px-2 py-1 rounded hover:bg-amber-50 transition-colors">
                        Mark stale
                      </button>
                    )}
                    {ctx.status !== "active" && (
                      <button onClick={() => markStatus("active")} className="text-xs text-emerald-600 border border-emerald-200 px-2 py-1 rounded hover:bg-emerald-50 transition-colors">
                        Mark active
                      </button>
                    )}
                    {ctx.status !== "conflicting" && (
                      <button onClick={() => markStatus("conflicting")} className="text-xs text-red-600 border border-red-200 px-2 py-1 rounded hover:bg-red-50 transition-colors">
                        Mark conflicting
                      </button>
                    )}
                    <Link href={`/dashboard/lineage/${ctx.id}`} className="text-xs text-indigo-600 border border-indigo-200 px-2 py-1 rounded hover:bg-indigo-50 transition-colors">
                      View full lineage →
                    </Link>
                  </div>
                </>
              ) : (
                <div className="h-24 bg-slate-50 rounded-lg animate-pulse" />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function ContextPage() {
  const { data: agents = [] } = useAgents();
  const [filterStatus, setFilterStatus] = useState<ContextStatus | "">("");
  const [filterProducer, setFilterProducer] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [slideOpen, setSlideOpen] = useState(false);

  const { data: contexts = [], isLoading } = useContextList({
    status: filterStatus || undefined,
    producer_id: filterProducer || undefined,
  });
  const { data: searchResults = [], isFetching: searching } = useContextSearch(activeSearch);
  const displayContexts = activeSearch ? searchResults : contexts;

  const [pKey, setPKey] = useState("");
  const [pValue, setPValue] = useState("{}");
  const [pType, setPType] = useState("");
  const [pProducer, setPProducer] = useState("");
  const [pValueError, setPValueError] = useState("");
  const [pPublic, setPPublic] = useState(false);
  const publishContext = usePublishContext();

  async function handlePublish() {
    let parsedValue;
    try { parsedValue = JSON.parse(pValue); }
    catch { setPValueError("Invalid JSON"); return; }
    setPValueError("");
    if (!pKey || !pType || !pProducer) { toast.error("All fields are required"); return; }
    try {
      await publishContext.mutateAsync({ key: pKey, value: parsedValue, context_type: pType, producer_id: pProducer });
      toast.success(`Context "${pKey}" published`);
      setSlideOpen(false);
      setPKey(""); setPValue("{}"); setPType(""); setPProducer(""); setPPublic(false);
    } catch { toast.error("Failed to publish context"); }
  }

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Context</h1>
          <p className="text-slate-500 text-sm mt-0.5">Explore and manage your published context.</p>
        </div>
        <Button onClick={() => setSlideOpen(true)}>
          <Upload className="h-4 w-4" />
          Publish Context
        </Button>
      </motion.div>

      {/* Filters bar */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-48 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by key..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); if (!e.target.value) setActiveSearch(""); }}
            onKeyDown={(e) => e.key === "Enter" && setActiveSearch(searchQuery)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as ContextStatus | "")}
          className="text-sm rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select
          value={filterProducer}
          onChange={(e) => setFilterProducer(e.target.value)}
          className="text-sm rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All agents</option>
          {agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        {activeSearch && (
          <Button variant="ghost" size="sm" onClick={() => { setActiveSearch(""); setSearchQuery(""); }}>
            Clear search
          </Button>
        )}
      </div>

      {/* Context grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-white rounded-lg border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : displayContexts.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-lg border border-slate-200">
          <Database className="h-10 w-10 text-slate-200 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-600">
            {activeSearch ? "No results found" : "No context published yet"}
          </p>
          {!activeSearch && <p className="text-xs text-slate-400 mt-1">Publish your first context to get started.</p>}
          {!activeSearch && (
            <Button className="mt-4" size="sm" onClick={() => setSlideOpen(true)}>
              <Upload className="h-3.5 w-3.5" /> Publish Context
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {displayContexts.map((ctx) => (
            <ContextCard key={ctx.id} ctx={ctx} agents={agents} />
          ))}
        </div>
      )}

      {/* Publish slide-over */}
      <SlideOver open={slideOpen} onClose={() => setSlideOpen(false)} title="Publish Context">
        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Key *</label>
            <input type="text" placeholder="e.g. translation_result" value={pKey} onChange={(e) => setPKey(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Context Type *</label>
            <input type="text" placeholder="e.g. translation_output" value={pType} onChange={(e) => setPType(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Producer Agent *</label>
            <select value={pProducer} onChange={(e) => setPProducer(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors">
              <option value="">Select an agent...</option>
              {agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Value (JSON) *</label>
            <textarea value={pValue} onChange={(e) => { setPValue(e.target.value); setPValueError(""); }} rows={5}
              className={`w-full rounded-lg border px-4 py-3 text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none transition-colors ${pValueError ? "border-red-400" : "border-slate-200"}`} />
            {pValueError && <p className="text-xs text-red-600">{pValueError}</p>}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setPPublic(!pPublic)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${pPublic ? "border-indigo-200 bg-indigo-50 text-indigo-600" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}
            >
              {pPublic ? <Globe className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
              {pPublic ? "Public" : "Private"}
            </button>
            <span className="text-xs text-slate-400">{pPublic ? "Visible to all agents" : "Only visible to your workspace"}</span>
          </div>
          <div className="flex gap-2 pt-2">
            <Button onClick={handlePublish} disabled={publishContext.isPending} className="flex-1">
              {publishContext.isPending ? "Publishing..." : "Publish"}
            </Button>
            <Button variant="secondary" onClick={() => setSlideOpen(false)}>Cancel</Button>
          </div>
        </div>
      </SlideOver>
    </div>
  );
}
