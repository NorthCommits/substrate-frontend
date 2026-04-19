"use client";
import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Bot, Database, Bell } from "lucide-react";

function useCountUp(target: number, enabled: boolean, duration = 1400) {
  const [value, setValue] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!enabled || startedRef.current) return;
    startedRef.current = true;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      setValue(Math.round((1 - Math.pow(1 - progress, 3)) * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, enabled, duration]);

  return value;
}

function Stat({
  value,
  label,
  enabled,
  icon: Icon,
}: {
  value: number;
  label: string;
  enabled: boolean;
  icon: React.ComponentType<{ className?: string }>;
}) {
  const count = useCountUp(value, enabled);
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-6">
      <div className="h-10 w-10 bg-indigo-50 rounded-lg flex items-center justify-center">
        <Icon className="h-5 w-5 text-indigo-600" />
      </div>
      <p className="text-4xl font-bold text-slate-900 tabular-nums tracking-tight">
        {count.toLocaleString()}
      </p>
      <p className="text-slate-500 text-sm">{label}</p>
    </div>
  );
}

export function LiveStats() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const { data } = useQuery({
    queryKey: ["public-stats"],
    queryFn: async () => {
      const res = await fetch("https://substrate-backend.onrender.com/graph/public");
      if (!res.ok) throw new Error("unavailable");
      return res.json() as Promise<{
        total_public_agents?: number;
        total_public_contexts?: number;
        active_subscriptions?: number;
      }>;
    },
    retry: false,
    staleTime: 60_000,
  });

  const agents = data?.total_public_agents ?? 0;
  const contexts = data?.total_public_contexts ?? 0;
  const subscriptions = data?.active_subscriptions ?? 0;

  return (
    <section id="live-stats" ref={ref} className="py-6 bg-slate-50 border-y border-slate-100">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-slate-200"
        >
          <Stat value={agents} label="Public Agents" enabled={isInView} icon={Bot} />
          <Stat value={contexts} label="Public Contexts" enabled={isInView} icon={Database} />
          <Stat value={subscriptions} label="Active Subscriptions" enabled={isInView} icon={Bell} />
          <div className="flex flex-col items-center gap-3 px-6 py-6">
            <div className="h-10 w-10 bg-emerald-50 rounded-lg flex items-center justify-center">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </span>
            </div>
            <p className="text-4xl font-bold text-emerald-600 tracking-tight">Live</p>
            <p className="text-slate-500 text-sm">Platform Status</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
