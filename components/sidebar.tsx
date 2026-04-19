"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Network,
  Bot,
  Database,
  RotateCcw,
  Loader2,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAgents } from "@/hooks/use-agents";
import { resetAndReseed, getOrCreateApiKey } from "@/lib/seed";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const nav = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Graph", href: "/graph", icon: Network },
  { label: "Agents", href: "/agents", icon: Bot },
  { label: "Context", href: "/context", icon: Database },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const qc = useQueryClient();
  const { data: agents = [] } = useAgents();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const hasAgents = agents.length > 0;

  async function handleReset() {
    setResetting(true);
    try {
      const apiKey = await getOrCreateApiKey();
      await resetAndReseed(apiKey);
      await qc.invalidateQueries();
      setConfirmOpen(false);
      toast.success("System reset and reseeded");
      router.push("/dashboard/graph");
    } catch {
      toast.error("Reset failed. Please try again.");
    } finally {
      setResetting(false);
    }
  }

  function handleNavClick() {
    setMobileOpen(false);
  }

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-6 w-6 bg-indigo-600 rounded-md flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">S</span>
          </div>
          <span className="text-slate-900 font-semibold text-sm tracking-tight">Substrate</span>
        </div>
        {/* Mobile close */}
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-1 text-slate-400 hover:text-slate-700 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5">
        {nav.map(({ label, href, icon: Icon }) => {
          const isActive =
            pathname === href ||
            (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={handleNavClick}
              className={cn(
                "relative flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors duration-150 group",
                isActive
                  ? "text-indigo-600 bg-indigo-50"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-indicator"
                  className="absolute left-0 top-1 bottom-1 w-0.5 bg-indigo-600 rounded-full"
                  transition={{ duration: 0.2, ease: "easeOut" }}
                />
              )}
              <Icon
                className={cn(
                  "h-4 w-4 flex-shrink-0",
                  isActive
                    ? "text-indigo-600"
                    : "text-slate-400 group-hover:text-slate-600"
                )}
              />
              <span className="font-medium">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-5 py-4 border-t border-slate-100 space-y-2">
        <span className="text-xs text-slate-400 block">v0.1.0</span>
        {hasAgents && (
          <button
            onClick={() => setConfirmOpen(true)}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            Reset &amp; Reseed
          </button>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* ── Mobile top bar ──────────────────────────────────────────────── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 h-14 bg-white border-b border-slate-200 flex items-center px-4 gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 bg-indigo-600 rounded-md flex items-center justify-center flex-shrink-0">
            <span className="text-white text-[10px] font-bold">S</span>
          </div>
          <span className="font-semibold text-sm text-slate-900 tracking-tight">Substrate</span>
        </div>
      </div>

      {/* ── Mobile overlay ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="lg:hidden fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Mobile sidebar drawer ───────────────────────────────────────── */}
      <motion.aside
        initial={false}
        animate={{ x: mobileOpen ? 0 : "-100%" }}
        transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-[240px] bg-white border-r border-slate-200 flex flex-col"
      >
        {sidebarContent}
      </motion.aside>

      {/* ── Desktop sidebar (always visible) ───────────────────────────── */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-[240px] bg-white border-r border-slate-200 flex-col z-30">
        {sidebarContent}
      </aside>

      {/* Confirmation modal */}
      <Modal
        open={confirmOpen}
        onClose={() => !resetting && setConfirmOpen(false)}
        title="Reset & Reseed"
      >
        <p className="text-sm text-slate-600 mb-5">
          This will delete{" "}
          <span className="font-semibold text-slate-900">all agents and context</span>{" "}
          and reseed with demo data. Are you sure?
        </p>
        <div className="flex gap-2">
          <Button
            variant="danger"
            onClick={handleReset}
            disabled={resetting}
            className="flex-1"
          >
            {resetting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Resetting...
              </>
            ) : (
              "Yes, Reset & Reseed"
            )}
          </Button>
          <Button
            variant="secondary"
            onClick={() => setConfirmOpen(false)}
            disabled={resetting}
          >
            Cancel
          </Button>
        </div>
      </Modal>
    </>
  );
}
