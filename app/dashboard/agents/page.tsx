"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Bot, Pencil, Trash2, Check, X } from "lucide-react";
import { toast } from "sonner";
import { useAgents, useCreateAgent, useUpdateAgent, useDeleteAgent } from "@/hooks/use-agents";
import { AgentResponse } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge, StatusDot } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { SlideOver } from "@/components/ui/slide-over";
import { formatDateShort } from "@/lib/utils";

export default function AgentsPage() {
  const { data: agents = [], isLoading } = useAgents();
  const createAgent = useCreateAgent();
  const updateAgent = useUpdateAgent();
  const deleteAgent = useDeleteAgent();

  const [search, setSearch] = useState("");
  const [slideOpen, setSlideOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AgentResponse | null>(null);
  const [editTarget, setEditTarget] = useState<AgentResponse | null>(null);
  const [editDescription, setEditDescription] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [nameError, setNameError] = useState("");

  const filtered = agents.filter((a) => a.name.toLowerCase().includes(search.toLowerCase()));

  async function handleCreate() {
    if (!name.trim()) { setNameError("Name is required"); return; }
    setNameError("");
    try {
      await createAgent.mutateAsync({ name: name.trim(), description: description || null });
      toast.success(`Agent "${name}" registered`);
      setSlideOpen(false);
      setName(""); setDescription("");
    } catch { toast.error("Failed to register agent"); }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteAgent.mutateAsync(deleteTarget.id);
      toast.success(`Agent "${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
    } catch { toast.error("Failed to delete agent"); }
  }

  async function handleEditSave(agent: AgentResponse) {
    try {
      await updateAgent.mutateAsync({ id: agent.id, body: { description: editDescription || null } });
      toast.success("Agent updated");
      setEditTarget(null);
    } catch { toast.error("Failed to update agent"); }
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
          <h1 className="text-2xl font-bold text-slate-900">Agents</h1>
          <p className="text-slate-500 text-sm mt-0.5">Register and manage your AI agents.</p>
        </div>
        <Button onClick={() => setSlideOpen(true)}>
          <Bot className="h-4 w-4" />
          Register Agent
        </Button>
      </motion.div>

      {/* Search */}
      <div className="mb-4 relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search agents..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
        />
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-white rounded-lg border border-slate-200 overflow-hidden"
      >
        {isLoading ? (
          <div className="divide-y divide-slate-50">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="px-6 py-4 animate-pulse flex gap-4">
                <div className="h-4 bg-slate-100 rounded w-32" />
                <div className="h-4 bg-slate-100 rounded w-48" />
                <div className="h-4 bg-slate-100 rounded w-16 ml-auto" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Bot className="h-10 w-10 text-slate-200 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-600">
              {search ? "No agents match your search" : "No agents registered yet"}
            </p>
            {!search && <p className="text-xs text-slate-400 mt-1">Register your first agent to get started.</p>}
            {!search && (
              <Button className="mt-4" onClick={() => setSlideOpen(true)} size="sm">
                <Plus className="h-3.5 w-3.5" /> Register Agent
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="px-6 py-3 border-b border-slate-100 grid grid-cols-[1fr_2fr_100px_120px_80px] gap-4 text-xs font-medium text-slate-500 uppercase tracking-wide">
              <span>Name</span><span>Description</span><span>Status</span><span>Created</span>
              <span className="text-right">Actions</span>
            </div>
            <div className="divide-y divide-slate-50">
              <AnimatePresence>
                {filtered.map((agent, i) => (
                  <motion.div
                    key={agent.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="px-6 py-3.5 grid grid-cols-[1fr_2fr_100px_120px_80px] gap-4 items-center hover:bg-slate-50 transition-colors"
                  >
                    <span className="text-sm font-medium text-slate-900 truncate">{agent.name}</span>

                    {editTarget?.id === agent.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          autoFocus
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          className="flex-1 text-sm px-2 py-1 rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleEditSave(agent);
                            if (e.key === "Escape") setEditTarget(null);
                          }}
                        />
                        <button onClick={() => handleEditSave(agent)} className="text-emerald-600 hover:text-emerald-700">
                          <Check className="h-4 w-4" />
                        </button>
                        <button onClick={() => setEditTarget(null)} className="text-slate-400 hover:text-slate-700">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-sm text-slate-500 truncate">
                        {agent.description ?? <span className="text-slate-300 italic">No description</span>}
                      </span>
                    )}

                    <Badge variant={agent.is_active ? "active" : "inactive"}>
                      <StatusDot status={agent.is_active ? "active" : "inactive"} />
                      {agent.is_active ? "Active" : "Inactive"}
                    </Badge>

                    <span className="text-xs text-slate-500">{formatDateShort(agent.created_at)}</span>

                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => { setEditTarget(agent); setEditDescription(agent.description ?? ""); }}
                        className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        title="Edit"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(agent)}
                        className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </>
        )}
      </motion.div>

      {/* Register slide-over */}
      <SlideOver open={slideOpen} onClose={() => { setSlideOpen(false); setName(""); setDescription(""); setNameError(""); }} title="Register Agent">
        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Name *</label>
            <input
              type="text"
              placeholder="e.g. research-agent"
              value={name}
              onChange={(e) => { setName(e.target.value); if (nameError) setNameError(""); }}
              className={`w-full rounded-lg border px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${nameError ? "border-red-400" : "border-slate-200"}`}
            />
            {nameError && <p className="text-xs text-red-600">{nameError}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Description</label>
            <textarea
              placeholder="Optional description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors resize-none"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button onClick={handleCreate} disabled={createAgent.isPending} className="flex-1">
              {createAgent.isPending ? "Registering..." : "Register Agent"}
            </Button>
            <Button variant="secondary" onClick={() => setSlideOpen(false)}>Cancel</Button>
          </div>
        </div>
      </SlideOver>

      {/* Delete modal */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Agent">
        <p className="text-sm text-slate-600 mb-5">
          This will permanently delete{" "}
          <span className="font-semibold text-slate-900">&ldquo;{deleteTarget?.name}&rdquo;</span> and all its context.
        </p>
        <div className="flex gap-2">
          <Button variant="danger" onClick={handleDelete} disabled={deleteAgent.isPending} className="flex-1">
            {deleteAgent.isPending ? "Deleting..." : "Delete"}
          </Button>
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
        </div>
      </Modal>
    </div>
  );
}
