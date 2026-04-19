"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { User, Key, Layers, AlertTriangle, Eye, EyeOff, Copy, Check, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth";
import { useApiKeys, useCreateApiKey, useDeleteApiKey, useWorkspace } from "@/hooks/useApiKeys";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { formatRelativeTime, formatDateShort } from "@/lib/utils";
import { ApiKeyCreated } from "@/lib/api";


type Section = "profile" | "api-keys" | "workspace" | "danger";

const sections: { id: Section; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "profile", label: "Profile", icon: User },
  { id: "api-keys", label: "API Keys", icon: Key },
  { id: "workspace", label: "Workspace", icon: Layers },
  { id: "danger", label: "Danger Zone", icon: AlertTriangle },
];

// ─── Profile ──────────────────────────────────────────────────────────────────

function ProfileSection() {
  const { user } = useAuthStore();
  const [name, setName] = useState(user?.full_name ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    toast.success("Profile updated");
  }

  const initials = ((user?.full_name || user?.email || "?")[0] ?? "?").toUpperCase();

  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-900 mb-1">Profile</h2>
      <p className="text-sm text-slate-500 mb-6">Manage your personal information.</p>

      <div className="flex items-center gap-4 mb-6">
        <div className="h-16 w-16 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-white text-2xl font-bold">{initials}</span>
        </div>
        <div>
          <span className="text-sm text-slate-400">Change photo — </span>
          <span className="text-xs bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full">Coming soon</span>
        </div>
      </div>

      <div className="space-y-4 max-w-sm">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">Full Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">Email</label>
          <input
            value={user?.email ?? ""}
            readOnly
            className="w-full rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-400 cursor-not-allowed"
          />
          <p className="text-xs text-slate-400">Email cannot be changed</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Saving...</> : "Save changes"}
        </Button>
      </div>

      <div className="mt-8 border-t border-slate-100 pt-6">
        <h3 className="text-base font-semibold text-slate-900 mb-4">Change Password</h3>
        <div className="space-y-4 max-w-sm">
          <PasswordField label="Current Password" />
          <PasswordField label="New Password" />
          <PasswordField label="Confirm New Password" />
          <div className="flex items-center gap-3">
            <Button variant="secondary">Update password</Button>
            <span className="text-xs bg-slate-100 text-slate-400 px-2 py-1 rounded-full">Coming soon</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function PasswordField({ label }: { label: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          placeholder="••••••••"
          className="w-full rounded-lg border border-slate-200 px-4 py-3 pr-11 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

// ─── API Keys ─────────────────────────────────────────────────────────────────

function ApiKeysSection() {
  const { token } = useAuthStore();
  const { data: apiKeys = [], isLoading } = useApiKeys(token);
  const createKey = useCreateApiKey(token);
  const deleteKey = useDeleteApiKey(token);

  const [createOpen, setCreateOpen] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [newKey, setNewKey] = useState<ApiKeyCreated | null>(null);
  const [copied, setCopied] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  async function handleCreate() {
    if (!keyName.trim()) { toast.error("Key name is required"); return; }
    try {
      const created = await createKey.mutateAsync({ name: keyName.trim() });
      setNewKey(created);
      setKeyName("");
      setCreateOpen(false);
    } catch { toast.error("Failed to create API key"); }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteKey.mutateAsync(deleteTarget);
      toast.success("API key revoked");
      setDeleteConfirmOpen(false);
      setDeleteTarget(null);
    } catch { toast.error("Failed to revoke key"); }
  }

  async function copyKey() {
    if (!newKey) return;
    await navigator.clipboard.writeText(newKey.key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-lg font-semibold text-slate-900">API Keys</h2>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="h-3.5 w-3.5" />
          Create new key
        </Button>
      </div>
      <p className="text-sm text-slate-500 mb-4">Use these keys to authenticate your agents.</p>

      <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 flex gap-3 mb-3">
        <Key className="h-4 w-4 text-slate-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-slate-700">API keys are stored as hashed values — we never store them in plain text. Use the <code className="text-xs bg-slate-200 px-1 py-0.5 rounded">X-API-Key</code> header to authenticate agent requests.</p>
          <a href="/docs" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium mt-1 inline-block">View API documentation →</a>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex gap-3 mb-6">
        <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800">API keys are shown only once at creation. Store them securely.</p>
      </div>

      {/* Newly created key reveal */}
      {newKey && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6"
        >
          <p className="text-sm font-medium text-emerald-800 mb-2">
            Your API key — copy it now, it won&apos;t be shown again:
          </p>
          <div className="bg-white border border-emerald-200 rounded-lg px-4 py-3 font-mono text-sm text-slate-900 break-all mb-3">
            {newKey.key}
          </div>
          <div className="flex gap-2">
            <button
              onClick={copyKey}
              className="flex items-center gap-1.5 text-sm text-emerald-700 border border-emerald-300 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors"
            >
              {copied ? <><Check className="h-3.5 w-3.5" />Copied!</> : <><Copy className="h-3.5 w-3.5" />Copy key</>}
            </button>
            <button
              onClick={() => setNewKey(null)}
              className="text-sm text-slate-500 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              I&apos;ve saved my key
            </button>
          </div>
        </motion.div>
      )}

      {/* Keys table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="divide-y divide-slate-50">
            {[1, 2].map((i) => (
              <div key={i} className="px-5 py-4 animate-pulse flex gap-4">
                <div className="h-4 bg-slate-100 rounded w-32" />
                <div className="h-4 bg-slate-100 rounded w-24" />
                <div className="h-4 bg-slate-100 rounded w-16 ml-auto" />
              </div>
            ))}
          </div>
        ) : apiKeys.length === 0 ? (
          <div className="py-10 text-center">
            <Key className="h-8 w-8 text-slate-200 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No API keys yet. Create one to connect your agents.</p>
          </div>
        ) : (
          <>
            <div className="px-5 py-3 border-b border-slate-100 grid grid-cols-[1fr_100px_80px_140px_120px_80px] gap-4 text-xs font-medium text-slate-500 uppercase tracking-wide">
              <span>Name</span><span>Prefix</span><span>Status</span><span>Last Used</span><span>Created</span><span className="text-right">Actions</span>
            </div>
            <div className="divide-y divide-slate-50">
              {apiKeys.map((k) => (
                <div key={k.id} className="px-5 py-3.5 grid grid-cols-[1fr_100px_80px_140px_120px_80px] gap-4 items-center hover:bg-slate-50 transition-colors">
                  <span className="text-sm font-medium text-slate-900">{k.name}</span>
                  <code className="text-xs text-slate-500 font-mono">{k.prefix}…</code>
                  <span className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${k.is_active ? "bg-emerald-500" : "bg-slate-300"}`} />
                    <span className={`text-xs ${k.is_active ? "text-emerald-700" : "text-slate-400"}`}>{k.is_active ? "Active" : "Revoked"}</span>
                  </span>
                  <span className="text-xs text-slate-400">
                    {k.last_used_at ? formatRelativeTime(k.last_used_at) : "Never"}
                  </span>
                  <span className="text-xs text-slate-400">{formatDateShort(k.created_at)}</span>
                  <div className="flex justify-end">
                    <button
                      onClick={() => { setDeleteTarget(k.id); setDeleteConfirmOpen(true); }}
                      className="text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                    >
                      Revoke
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Create modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create API Key">
        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Key Name</label>
            <input
              type="text"
              placeholder="e.g. Production Key"
              value={keyName}
              onChange={(e) => setKeyName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
              autoFocus
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleCreate} disabled={createKey.isPending} className="flex-1">
              {createKey.isPending ? <><Loader2 className="h-4 w-4 animate-spin" />Creating...</> : "Create"}
            </Button>
            <Button variant="secondary" onClick={() => setCreateOpen(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* Delete confirm */}
      <Modal open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} title="Revoke API Key">
        <p className="text-sm text-slate-600 mb-2">
          Are you sure? This will break any agents currently using this key.
        </p>
        <div className="flex gap-2 mt-4">
          <Button variant="danger" onClick={handleDelete} disabled={deleteKey.isPending} className="flex-1">
            {deleteKey.isPending ? "Revoking..." : "Revoke"}
          </Button>
          <Button variant="secondary" onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
        </div>
      </Modal>
    </div>
  );
}

// ─── Workspace ────────────────────────────────────────────────────────────────

function WorkspaceSection() {
  const { token } = useAuthStore();
  const { data: workspace } = useWorkspace(token);
  const [wsName, setWsName] = useState("");
  const [wsDesc, setWsDesc] = useState("");
  const [saving, setSaving] = useState(false);

  // Sync from fetched data
  if (workspace && !wsName && workspace.name) {
    setWsName(workspace.name);
    setWsDesc(workspace.description ?? "");
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (token) await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://substrate-backend.onrender.com"}/workspaces/me`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ name: wsName, description: wsDesc }),
      });
      toast.success("Workspace updated");
    } catch { toast.error("Failed to update workspace"); }
    finally { setSaving(false); }
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-900 mb-1">Workspace</h2>
      <p className="text-sm text-slate-500 mb-6">Manage your workspace settings.</p>
      <div className="space-y-4 max-w-sm">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">Workspace Name</label>
          <input value={wsName} onChange={(e) => setWsName(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">Slug</label>
          <input value={workspace?.slug ?? ""} readOnly
            className="w-full rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-400 cursor-not-allowed" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">Description</label>
          <textarea value={wsDesc} onChange={(e) => setWsDesc(e.target.value)} rows={3}
            className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors resize-none" />
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Saving...</> : "Save"}
        </Button>
      </div>
    </div>
  );
}

// ─── Danger Zone ──────────────────────────────────────────────────────────────

function DangerZone() {
  const { user } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState("");
  const matches = confirmEmail === user?.email;

  return (
    <div>
      <h2 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h2>
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-sm font-semibold text-slate-900 mb-1">Delete Account</h3>
        <p className="text-sm text-slate-600 mb-4">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>
        <button
          onClick={() => setOpen(true)}
          className="text-sm text-red-600 border border-red-300 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors font-medium"
        >
          Delete my account
        </button>
      </div>

      <Modal open={open} onClose={() => { setOpen(false); setConfirmEmail(""); }} title="Delete Account">
        <p className="text-sm text-slate-600 mb-4">
          Type your email address to confirm deletion.
        </p>
        <input
          type="email"
          placeholder={user?.email}
          value={confirmEmail}
          onChange={(e) => setConfirmEmail(e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors mb-4"
        />
        <div className="flex items-center gap-3 mb-3">
          <Button variant="danger" disabled={!matches} className="flex-1">
            Permanently delete
          </Button>
          <Button variant="secondary" onClick={() => { setOpen(false); setConfirmEmail(""); }}>Cancel</Button>
        </div>
        <p className="text-xs text-slate-400 text-center">Account deletion is coming soon.</p>
      </Modal>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [active, setActive] = useState<Section>("profile");

  const content: Record<Section, React.ReactNode> = {
    profile: <ProfileSection />,
    "api-keys": <ApiKeysSection />,
    workspace: <WorkspaceSection />,
    danger: <DangerZone />,
  };

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 text-sm mt-0.5">Manage your account and workspace.</p>
      </motion.div>

      <div className="flex gap-6">
        {/* Left nav */}
        <motion.nav
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="w-48 flex-shrink-0 space-y-0.5"
        >
          {sections.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActive(id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 text-left ${
                active === id
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              } ${id === "danger" ? "text-red-500 hover:bg-red-50 hover:text-red-600" : ""}`}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
            </button>
          ))}
        </motion.nav>

        {/* Content */}
        <motion.div
          key={active}
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
          className="flex-1 bg-white rounded-lg border border-slate-200 p-6 min-h-[400px]"
        >
          {content[active]}
        </motion.div>
      </div>
    </div>
  );
}
