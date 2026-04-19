"use client";
import { useEffect, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  MarkerType,
  Handle,
  Position,
  NodeProps,
  ReactFlowProvider,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";
import { motion, AnimatePresence } from "framer-motion";
import { ZoomIn, ZoomOut, Maximize2, RefreshCw, Network, X, Bot } from "lucide-react";
import { useGraph } from "@/hooks/use-graph";
import { Badge, StatusDot } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function AgentNode({ data, selected }: NodeProps) {
  return (
    <div className={`bg-white rounded-xl border-2 px-4 py-3 min-w-[160px] shadow-sm transition-all ${selected ? "border-indigo-500 shadow-lg shadow-indigo-100" : "border-indigo-200"}`}>
      <Handle type="target" position={Position.Left} className="!bg-indigo-400 !w-2 !h-2" />
      <div className="flex items-center gap-2">
        <div className={`h-2 w-2 rounded-full flex-shrink-0 ${data.is_active ? "bg-emerald-500" : "bg-slate-300"}`} />
        <span className="text-sm font-semibold text-slate-900 truncate max-w-[120px]">{data.label}</span>
      </div>
      {data.workspace && <p className="text-xs text-slate-400 mt-0.5 truncate">{data.workspace}</p>}
      <Handle type="source" position={Position.Right} className="!bg-indigo-400 !w-2 !h-2" />
    </div>
  );
}

function ContextNode({ data, selected }: NodeProps) {
  const styles: Record<string, string> = {
    active: "border-indigo-300 bg-indigo-50",
    stale: "border-amber-300 bg-amber-50",
    conflicting: "border-red-300 bg-red-50",
  };
  return (
    <div className={`rounded-full border-2 px-4 py-2.5 shadow-sm text-center transition-all ${styles[data.status] ?? "border-slate-200 bg-white"} ${selected ? "ring-2 ring-indigo-400 ring-offset-1" : ""}`}>
      <Handle type="target" position={Position.Left} className="!bg-slate-400 !w-2 !h-2" />
      <span className="text-xs font-semibold text-slate-800 block max-w-[120px] truncate">{data.label}</span>
      <span className="text-[10px] text-slate-500">{data.context_type}</span>
      <Handle type="source" position={Position.Right} className="!bg-slate-400 !w-2 !h-2" />
    </div>
  );
}

const nodeTypes = { agent: AgentNode, context: ContextNode };

function Field({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{label}</p>
      <p className={`text-sm text-slate-900 mt-0.5 break-all ${mono ? "font-mono text-xs text-slate-600" : ""}`}>{value}</p>
    </div>
  );
}

function DetailPanel({ node, onClose }: { node: Node | null; onClose: () => void }) {
  return (
    <AnimatePresence>
      {node && (
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 24 }}
          transition={{ duration: 0.2 }}
          className="absolute top-4 right-4 z-10 w-80 bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-900">
              {node.type === "agent" ? "Agent" : "Context"} Details
            </h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="px-4 py-4 space-y-3 max-h-[65vh] overflow-y-auto">
            {node.type === "agent" ? (
              <>
                <Field label="Name" value={String(node.data.label)} />
                <Field label="Status" value={node.data.is_active ? "Active" : "Inactive"} />
                {node.data.description && <Field label="Description" value={String(node.data.description)} />}
                <Field label="ID" value={node.id} mono />
              </>
            ) : (
              <>
                <Field label="Key" value={String(node.data.label)} />
                <Field label="Type" value={String(node.data.context_type)} />
                <Field label="Status" value={String(node.data.status)} />
                <Field label="ID" value={node.id} mono />
                {node.data.value && (
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Value</p>
                    <pre className="text-xs bg-slate-50 rounded-lg p-3 text-slate-700 border border-slate-100 font-mono overflow-x-auto max-h-32">
                      {JSON.stringify(node.data.value, null, 2)}
                    </pre>
                  </div>
                )}
                <Link href={`/dashboard/lineage/${node.id}`} className="text-xs text-indigo-600 hover:text-indigo-700 block mt-2">
                  View lineage →
                </Link>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function GraphCanvas() {
  const { data: graphData, refetch, dataUpdatedAt, isFetching } = useGraph();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const lastUpdated = dataUpdatedAt ? new Date(dataUpdatedAt) : null;

  useEffect(() => {
    if (!graphData) return;
    const raw = graphData as { nodes?: unknown[]; edges?: unknown[] };
    const rawNodes = raw.nodes ?? [];
    const rawEdges = raw.edges ?? [];

    const agentNodes = rawNodes
      .filter((n: unknown) => (n as { type?: string }).type === "agent")
      .map((n: unknown, i: number) => {
        const node = n as { id: string; data: Record<string, unknown> };
        return {
          id: node.id, type: "agent",
          position: { x: 80, y: 80 + i * 150 },
          data: { label: String(node.data?.name ?? node.id), is_active: node.data?.is_active, description: node.data?.description },
        } as Node;
      });

    const contextNodes = rawNodes
      .filter((n: unknown) => (n as { type?: string }).type === "context")
      .map((n: unknown, i: number) => {
        const node = n as { id: string; data: Record<string, unknown> };
        return {
          id: node.id, type: "context",
          position: { x: 480, y: 60 + i * 110 },
          data: { label: String(node.data?.key ?? node.id), context_type: node.data?.context_type, status: node.data?.status, value: node.data?.value },
        } as Node;
      });

    const flowEdges: Edge[] = rawEdges.map((e: unknown, i: number) => {
      const edge = e as { source: string; target: string; type?: string };
      const isProduces = edge.type === "produces";
      return {
        id: `e-${i}`, source: edge.source, target: edge.target, type: "smoothstep",
        animated: isProduces,
        style: { stroke: isProduces ? "#6366f1" : "#94a3b8", strokeDasharray: isProduces ? "0" : "5 5", strokeWidth: 1.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color: isProduces ? "#6366f1" : "#94a3b8" },
        label: edge.type, labelStyle: { fontSize: 10, fill: "#94a3b8" },
        labelBgStyle: { fill: "transparent" },
      };
    });

    setNodes([...agentNodes, ...contextNodes]);
    setEdges(flowEdges);
  }, [graphData, setNodes, setEdges]);

  return (
    <div className="relative h-full">
      <ReactFlow
        nodes={nodes} edges={edges}
        onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        onNodeClick={(_, node) => setSelectedNode((prev) => prev?.id === node.id ? null : node)}
        onPaneClick={() => setSelectedNode(null)}
        fitView fitViewOptions={{ padding: 0.3 }}
      >
        <Background color="#e2e8f0" gap={24} size={1} />
        <Controls showInteractive={false} className="!shadow-sm !border-slate-200 !rounded-lg" />
        <MiniMap nodeColor={(n) => n.type === "agent" ? "#6366f1" : "#94a3b8"} className="!shadow-sm !border-slate-200 !rounded-lg" />
      </ReactFlow>

      {/* Toolbar */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
        <div className="flex items-center gap-1 bg-white rounded-lg border border-slate-200 shadow-sm p-1">
          <button onClick={() => zoomIn()} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 transition-colors"><ZoomIn className="h-4 w-4" /></button>
          <button onClick={() => zoomOut()} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 transition-colors"><ZoomOut className="h-4 w-4" /></button>
          <button onClick={() => fitView({ padding: 0.2 })} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 transition-colors"><Maximize2 className="h-4 w-4" /></button>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 bg-white rounded-lg border border-slate-200 shadow-sm px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
          {lastUpdated ? `Updated ${formatRelativeTime(lastUpdated.toISOString())}` : "Refreshing..."}
        </button>
      </div>

      <DetailPanel node={selectedNode} onClose={() => setSelectedNode(null)} />

      {nodes.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <Network className="h-16 w-16 text-slate-200 mb-4" strokeWidth={1.2} />
          <p className="text-base font-medium text-slate-500">Your graph is empty</p>
          <p className="text-sm text-slate-400 mt-1 mb-4">Register agents and publish context to see your graph come alive.</p>
          <Link href="/dashboard/agents" className="pointer-events-auto">
            <Button size="sm"><Bot className="h-4 w-4" />Register Agent</Button>
          </Link>
        </div>
      )}
    </div>
  );
}

export default function GraphPage() {
  return (
    <div className="-mx-6 -mb-8" style={{ height: "calc(100vh - 56px)" }}>
      {/* Header bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Graph</h1>
          <p className="text-sm text-slate-500 mt-0.5">Live view of your agents and context.</p>
        </div>
        <Link
          href="https://substrate-backend.onrender.com/graph/public"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
        >
          View public graph →
        </Link>
      </div>

      {/* Canvas */}
      <div style={{ height: "calc(100% - 65px)" }}>
        <ReactFlowProvider>
          <GraphCanvas />
        </ReactFlowProvider>
      </div>
    </div>
  );
}
