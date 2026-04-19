"use client";
import { motion } from "framer-motion";

const agentLabels = ["Translation Agent", "RAG Agent", "Classification Agent"];

function AgentBox({ label, delay }: { label: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay }}
      animate={{
        x: [0, -3, 3, -3, 0],
        transition: {
          duration: 0.4,
          repeat: Infinity,
          repeatDelay: 3,
          repeatType: "loop",
        },
      }}
      className="bg-slate-100 border border-slate-300 rounded-lg p-4 text-center"
    >
      <span className="text-sm font-medium text-slate-700">{label}</span>
    </motion.div>
  );
}

export function Problem() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left — text */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
              The Problem
            </p>
            <h2 className="text-4xl font-bold text-slate-900 tracking-tight mb-6 leading-tight">
              Your agents are islands.
            </h2>
            <p className="text-slate-500 leading-relaxed mb-8">
              You build a translation agent. A classification agent. A RAG pipeline.
              They each do their job — but they don&apos;t talk to each other.
              Every agent starts from zero. Every session loses everything.
            </p>
            <div className="border-l-4 border-amber-400 bg-amber-50 p-4 rounded-r-lg">
              <p className="text-sm text-amber-800 leading-relaxed">
                <span className="font-semibold">95% of multi-agent AI systems fail in production</span>{" "}
                because agents cannot share context.
              </p>
            </div>
          </motion.div>

          {/* Right — animated illustration */}
          <div className="flex flex-col items-center gap-4">
            {agentLabels.map((label, i) => (
              <div key={label} className="w-full max-w-xs">
                <AgentBox label={label} delay={i * 0.1} />
                {i < agentLabels.length - 1 && (
                  <div className="flex flex-col items-center my-1">
                    <div className="w-px h-4 border-l-2 border-dashed border-red-300" />
                    <span className="text-red-400 text-lg leading-none">✕</span>
                    <div className="w-px h-4 border-l-2 border-dashed border-red-300" />
                  </div>
                )}
              </div>
            ))}
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="text-sm text-slate-400 mt-2"
            >
              Without Substrate
            </motion.p>
          </div>
        </div>
      </div>
    </section>
  );
}
