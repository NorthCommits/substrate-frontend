"use client";
import { motion } from "framer-motion";

const agentLabels = ["Translation Agent", "RAG Agent", "Classification Agent"];

function FlowingDot({ delay }: { delay: number }) {
  return (
    <motion.div
      className="absolute w-2.5 h-2.5 bg-indigo-500 rounded-full shadow-md shadow-indigo-300"
      initial={{ left: "0%", opacity: 0 }}
      animate={{ left: ["0%", "50%", "100%"], opacity: [0, 1, 0] }}
      transition={{
        duration: 1.6,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      style={{ top: "50%", transform: "translateY(-50%)" }}
    />
  );
}

export function Solution() {
  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left — animated illustration */}
          <div className="flex flex-col items-center gap-4 order-2 lg:order-1">
            {agentLabels.map((label, i) => (
              <div key={label} className="w-full max-w-xs">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="bg-white border-2 border-indigo-200 rounded-lg p-4 text-center shadow-sm"
                >
                  <span className="text-sm font-medium text-slate-700">{label}</span>
                </motion.div>
                {i < agentLabels.length - 1 && (
                  <div className="flex flex-col items-center my-1 relative">
                    {/* Hub connector line */}
                    <div className="relative w-full flex justify-center">
                      <div className="relative w-32 h-6 flex items-center">
                        <div className="absolute inset-x-0 h-px bg-indigo-200" />
                        <FlowingDot delay={i * 0.5} />
                        <FlowingDot delay={i * 0.5 + 0.8} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Center hub */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-col items-center gap-2 mt-2"
            >
              <div className="bg-indigo-600 rounded-lg px-5 py-3 flex items-center gap-2 shadow-lg shadow-indigo-200">
                <span className="text-white text-sm font-bold">■ Substrate</span>
              </div>
              <p className="text-sm text-slate-500">With Substrate</p>
            </motion.div>
          </div>

          {/* Right — text */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className="order-1 lg:order-2"
          >
            <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-3">
              The Solution
            </p>
            <h2 className="text-4xl font-bold text-slate-900 tracking-tight mb-6 leading-tight">
              Substrate is the nervous system.
            </h2>
            <p className="text-slate-500 leading-relaxed mb-10">
              One platform. Every agent connects to it. Context flows in real time.
              Subscriptions fire instantly. Lineage is tracked forever. Your agents
              finally work as a team.
            </p>

            {/* Micro-stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { stat: "< 100ms", label: "Context delivery" },
                { stat: "100%", label: "Lineage tracked" },
                { stat: "∞", label: "Context history" },
              ].map(({ stat, label }) => (
                <div key={label} className="text-center">
                  <p className="text-2xl font-bold text-slate-900">{stat}</p>
                  <p className="text-xs text-slate-400 mt-1">{label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
