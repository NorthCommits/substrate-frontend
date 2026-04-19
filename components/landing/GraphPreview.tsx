"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const nodes = [
  { id: "a1", x: 80, y: 60, label: "Translation Agent", type: "agent" },
  { id: "a2", x: 80, y: 220, label: "RAG Agent", type: "agent" },
  { id: "a3", x: 80, y: 380, label: "Classification Agent", type: "agent" },
  { id: "c1", x: 380, y: 140, label: "translation_output", type: "context" },
  { id: "c2", x: 380, y: 300, label: "rag_result", type: "context" },
];

const edges = [
  { from: { x: 200, y: 80 }, to: { x: 350, y: 152 } },
  { from: { x: 200, y: 240 }, to: { x: 350, y: 152 } },
  { from: { x: 200, y: 240 }, to: { x: 350, y: 312 } },
  { from: { x: 200, y: 400 }, to: { x: 350, y: 312 } },
];

function AnimatedDot({ path, delay }: { path: string; delay: number }) {
  return (
    <circle r={4} fill="#818cf8">
      <animateMotion
        path={path}
        dur="1.8s"
        begin={`${delay}s`}
        repeatCount="indefinite"
        calcMode="easeInOut"
      />
      <animate
        attributeName="opacity"
        values="0;1;1;0"
        dur="1.8s"
        begin={`${delay}s`}
        repeatCount="indefinite"
      />
    </circle>
  );
}

function edgePath(from: { x: number; y: number }, to: { x: number; y: number }) {
  const mx = (from.x + to.x) / 2;
  return `M ${from.x} ${from.y} C ${mx} ${from.y}, ${mx} ${to.y}, ${to.x} ${to.y}`;
}

export function GraphPreview() {
  return (
    <section className="py-24 bg-slate-900">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-white tracking-tight mb-4">
            Watch your agents come alive
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            The Substrate graph shows every agent, every context, and every subscription — live.
          </p>
        </motion.div>

        {/* Graph card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative bg-slate-800 rounded-xl border border-slate-700 p-8 overflow-hidden"
        >
          {/* Live badge */}
          <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-slate-700 px-3 py-1.5 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-xs text-slate-300">Live</span>
          </div>

          <svg width="100%" viewBox="0 0 580 460" className="overflow-visible">
            {/* Edges */}
            {edges.map((e, i) => {
              const d = edgePath(e.from, e.to);
              return (
                <g key={i}>
                  <path d={d} fill="none" stroke="#334155" strokeWidth={1.5} />
                  <AnimatedDot path={d} delay={i * 0.4} />
                </g>
              );
            })}

            {/* Agent nodes */}
            {nodes.filter((n) => n.type === "agent").map((n, i) => (
              <motion.g
                key={n.id}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <rect
                  x={n.x}
                  y={n.y - 22}
                  width={120}
                  height={44}
                  rx={8}
                  fill="#1e293b"
                  stroke="#6366f1"
                  strokeWidth={1.5}
                />
                <text
                  x={n.x + 60}
                  y={n.y + 5}
                  textAnchor="middle"
                  fill="#e2e8f0"
                  fontSize={11}
                  fontFamily="system-ui, sans-serif"
                >
                  {n.label}
                </text>
              </motion.g>
            ))}

            {/* Context nodes (pills) */}
            {nodes.filter((n) => n.type === "context").map((n, i) => (
              <motion.g
                key={n.id}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
              >
                <rect
                  x={n.x}
                  y={n.y - 18}
                  width={148}
                  height={36}
                  rx={18}
                  fill="#1e1b4b"
                  stroke="#818cf8"
                  strokeWidth={1}
                />
                <text
                  x={n.x + 74}
                  y={n.y + 4}
                  textAnchor="middle"
                  fill="#a5b4fc"
                  fontSize={10}
                  fontFamily="monospace, sans-serif"
                >
                  {n.label}
                </text>
              </motion.g>
            ))}
          </svg>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="text-center mt-8"
        >
          <Link
            href="/signup"
            className="inline-flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 transition-colors text-sm"
          >
            Get started to see your own agents here
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
