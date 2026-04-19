"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard,
  Bot,
  Database,
  Network,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { signOut } from "@/lib/auth";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Agents", href: "/dashboard/agents", icon: Bot },
  { label: "Context", href: "/dashboard/context", icon: Database },
  { label: "Graph", href: "/dashboard/graph", icon: Network },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 0);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    function outside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", outside);
    return () => document.removeEventListener("mousedown", outside);
  }, []);

  async function handleLogout() {
    await signOut();
    logout();
    router.push("/");
  }

  const initials = ((user?.full_name || user?.email || "?")[0] ?? "?").toUpperCase();

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 h-14 bg-white border-b transition-all duration-200 ${
        scrolled ? "border-slate-200 shadow-sm backdrop-blur-md" : "border-slate-200"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center gap-6">
        {/* Wordmark */}
        <Link href="/dashboard" className="flex items-center gap-2 flex-shrink-0 mr-2">
          <span className="h-5 w-5 bg-indigo-600 rounded-md inline-block" aria-hidden />
          <span className="font-bold text-slate-900 tracking-tight text-sm">Substrate</span>
        </Link>

        {/* Nav tabs */}
        <nav className="flex-1 flex items-stretch h-full">
          {navItems.map(({ label, href, icon: Icon }) => {
            const active =
              pathname === href ||
              (href !== "/dashboard" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-3 text-sm font-medium border-b-2 transition-all duration-150 ${
                  active
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Avatar dropdown */}
        <div className="relative flex-shrink-0" ref={ref}>
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-1.5 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <div className="h-8 w-8 bg-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-semibold">{initials}</span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                transition={{ duration: 0.12 }}
                className="absolute right-0 top-full mt-2 min-w-48 bg-white border border-slate-200 rounded-lg shadow-md overflow-hidden z-50"
              >
                {/* User info */}
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {user?.full_name || "User"}
                  </p>
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                </div>

                {/* Settings link */}
                <div className="p-1">
                  <Link
                    href="/dashboard/settings"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 rounded-md hover:bg-slate-100 transition-colors w-full"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                </div>

                <div className="border-t border-slate-100" />

                {/* Logout */}
                <div className="p-1">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-red-500 rounded-md hover:bg-red-50 transition-colors w-full"
                  >
                    <LogOut className="h-4 w-4" />
                    Log out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
