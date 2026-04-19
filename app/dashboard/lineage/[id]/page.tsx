"use client";
import { use } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, GitBranch } from "lucide-react";
import Link from "next/link";
import { useLineage } from "@/hooks/use-context";
import { formatDateTime } from "@/lib/utils";

const actionColors: Record<string, { bg: string; text: string; dot: string }> = {
  published: { bg: "bg-indigo-50", text: "text-indigo-700", dot: "bg-indigo-500" },
  consumed: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  marked_stale: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  marked_conflicting: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
  marked_active: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
};

export default function LineagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: events = [], isLoading, error } = useLineage(id);

  return (
    <div className="max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-3 mb-8"
      >
        <Link href="/dashboard/context" className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Context Lineage</h1>
          <p className="text-sm text-slate-500 mt-0.5 font-mono truncate max-w-xs">{id}</p>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-4 animate-pulse">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-slate-200 mt-1" />
                <div className="w-px flex-1 bg-slate-100 mt-1" />
              </div>
              <div className="flex-1 pb-6">
                <div className="h-4 bg-slate-100 rounded w-32 mb-2" />
                <div className="h-3 bg-slate-100 rounded w-48" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="py-12 text-center">
          <GitBranch className="h-10 w-10 text-slate-200 mx-auto mb-3" />
          <p className="text-sm text-slate-500">Failed to load lineage</p>
        </div>
      ) : events.length === 0 ? (
        <div className="py-12 text-center">
          <GitBranch className="h-10 w-10 text-slate-200 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-600">No lineage events yet</p>
          <p className="text-xs text-slate-400 mt-1">Events will appear here as agents interact with this context.</p>
        </div>
      ) : (
        <div className="relative">
          {events.map((event, i) => {
            const colors = actionColors[event.action] ?? actionColors.published;
            const isLast = i === events.length - 1;
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.06 }}
                className="flex gap-4"
              >
                {/* Timeline spine */}
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 ${colors.dot}`} />
                  {!isLast && <div className="w-px flex-1 bg-slate-100 mt-1 mb-0" />}
                </div>

                {/* Event card */}
                <div className={`flex-1 pb-6 ${isLast ? "" : ""}`}>
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium mb-2 ${colors.bg} ${colors.text}`}>
                    {event.action.replace(/_/g, " ")}
                  </div>
                  <div className="bg-white rounded-lg border border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{event.agent?.name ?? "Unknown agent"}</p>
                        {event.note && <p className="text-xs text-slate-500 mt-0.5">{event.note}</p>}
                      </div>
                      <time className="text-xs text-slate-400 flex-shrink-0">{formatDateTime(event.created_at)}</time>
                    </div>
                    {event.snapshot && (
                      <details className="mt-2">
                        <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-700 select-none">
                          View snapshot
                        </summary>
                        <pre className="mt-2 text-xs bg-slate-50 rounded-lg p-3 overflow-x-auto font-mono text-slate-700 border border-slate-100 max-h-48">
                          {JSON.stringify(event.snapshot, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
