"use client";
import { motion } from "framer-motion";
import { Activity, MessageSquare, FileText, TrendingUp, Code2 } from "lucide-react";

const cases = [
  {
    icon: Activity,
    title: "Healthcare AI",
    body: "Translation → Classification → RAG agents sharing medical content context seamlessly.",
    footer: "3 agents · translation_output, rag_output",
  },
  {
    icon: MessageSquare,
    title: "Customer Support",
    body: "Triage → Resolution → Follow-up agent pipeline with full context at every step.",
    footer: "3 agents · support_context, resolution_output",
  },
  {
    icon: FileText,
    title: "Content Pipeline",
    body: "Research → Writer → Editor → Publisher. Every agent knows what came before.",
    footer: "4 agents · research_output, draft_context",
  },
  {
    icon: TrendingUp,
    title: "Financial Analysis",
    body: "Data → Analysis → Report agents sharing market context with full lineage.",
    footer: "3 agents · market_data, analysis_output",
  },
  {
    icon: Code2,
    title: "Code Review",
    body: "Linter → Reviewer → Documentation agent pipeline with shared code context.",
    footer: "3 agents · lint_output, review_context",
  },
];

export function UseCases() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <h2 className="text-4xl font-bold text-slate-900 tracking-tight mb-4">
            Built for every multi-agent use case
          </h2>
          <p className="text-slate-500">
            From healthcare AI to content pipelines — Substrate powers them all.
          </p>
        </motion.div>

        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory -mx-6 px-6">
          {cases.map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="min-w-72 snap-start border border-slate-200 rounded-xl p-6 bg-white flex flex-col hover:border-indigo-200 hover:shadow-md transition-all duration-200 flex-shrink-0"
            >
              <div className="h-10 w-10 bg-indigo-50 rounded-lg flex items-center justify-center mb-4">
                <c.icon className="h-5 w-5 text-indigo-600" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-2">{c.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed flex-1">{c.body}</p>
              <div className="border-t border-slate-100 pt-3 mt-3">
                <p className="text-xs text-slate-400 font-mono">{c.footer}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
