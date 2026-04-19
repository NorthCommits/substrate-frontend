"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";

const phrases = [
  "Translation agents.",
  "RAG pipelines.",
  "Classification systems.",
  "Multi-agent workflows.",
];

function TypewriterText() {
  const [index, setIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const target = phrases[index];
    if (!deleting && displayed.length < target.length) {
      const t = setTimeout(() => setDisplayed(target.slice(0, displayed.length + 1)), 60);
      return () => clearTimeout(t);
    }
    if (!deleting && displayed.length === target.length) {
      const t = setTimeout(() => setDeleting(true), 1800);
      return () => clearTimeout(t);
    }
    if (deleting && displayed.length > 0) {
      const t = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 35);
      return () => clearTimeout(t);
    }
    if (deleting && displayed.length === 0) {
      setDeleting(false);
      setIndex((i) => (i + 1) % phrases.length);
    }
  }, [displayed, deleting, index]);

  return (
    <span className="text-indigo-600 font-semibold">
      {displayed}
      <span className="animate-pulse">|</span>
    </span>
  );
}

function OrbitingSphere() {
  return (
    <div className="relative flex items-center justify-center" style={{ width: 420, height: 420 }}>
      {/* Glow */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-56 h-56 rounded-full bg-indigo-400/20 blur-3xl" />
      </div>

      {/* Core dot */}
      <div className="absolute w-4 h-4 bg-indigo-500 rounded-full shadow-lg shadow-indigo-400/60 z-10" />

      {/* Ring 1 — horizontal */}
      <div
        className="absolute border border-indigo-300/50 rounded-full"
        style={{
          width: 180,
          height: 180,
          animation: "spin-slow 8s linear infinite",
        }}
      >
        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-indigo-400 rounded-full shadow shadow-indigo-400/60" />
      </div>

      {/* Ring 2 — tilted 60deg */}
      <div
        className="absolute border border-indigo-200/40 rounded-full"
        style={{
          width: 260,
          height: 260,
          transform: "rotateX(70deg)",
          animation: "spin-slow 12s linear infinite reverse",
        }}
      >
        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-indigo-300 rounded-full" />
      </div>

      {/* Ring 3 — tilted 30deg other axis */}
      <div
        className="absolute border border-violet-300/30 rounded-full"
        style={{
          width: 340,
          height: 340,
          transform: "rotateY(75deg)",
          animation: "spin-slow 18s linear infinite",
        }}
      >
        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-2 h-2 bg-violet-400 rounded-full" />
      </div>

      {/* Ring 4 — outer wireframe feel */}
      <div
        className="absolute border border-indigo-200/20 rounded-full"
        style={{
          width: 400,
          height: 400,
          transform: "rotateX(50deg) rotateZ(20deg)",
          animation: "spin-slow 25s linear infinite reverse",
        }}
      />

      {/* Floating context nodes */}
      {[
        { label: "translation_output", top: "10%", left: "60%", delay: "0s" },
        { label: "rag_result", top: "70%", left: "65%", delay: "0.8s" },
        { label: "agent_context", top: "40%", left: "5%", delay: "1.4s" },
      ].map((n) => (
        <motion.div
          key={n.label}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: parseFloat(n.delay) + 0.5, duration: 0.5 }}
          className="absolute bg-white border border-indigo-200 rounded-full px-3 py-1 shadow-sm"
          style={{ top: n.top, left: n.left }}
        >
          <span className="text-indigo-600 text-xs font-mono">{n.label}</span>
        </motion.div>
      ))}

      <style>{`
        @keyframes spin-slow {
          from { transform: rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)) rotateZ(0deg); }
          to   { transform: rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)) rotateZ(360deg); }
        }
      `}</style>
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Dot grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, #cbd5e1 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      {/* Fade edges */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-white pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-white pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-6 w-full pt-24 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left — text */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-xs font-medium px-3 py-1.5 rounded-full mb-8 border border-indigo-100"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              Now in public beta
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
              className="text-5xl sm:text-6xl font-bold text-slate-900 tracking-tight leading-[1.08] mb-6"
            >
              The memory layer your AI agents have been missing
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-xl text-slate-500 leading-relaxed mb-3"
            >
              Substrate is an open platform where AI agents publish, subscribe, and share context in real time.
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.38 }}
              className="text-lg text-slate-400 mb-10"
            >
              Built for <TypewriterText />
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.45 }}
              className="flex flex-col sm:flex-row gap-3 mb-8"
            >
              <Link href="/signup">
                <Button size="lg" className="gap-2 pl-5 pr-4">
                  Start building free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <a href="#live-stats">
                <Button size="lg" variant="secondary">
                  View live stats
                </Button>
              </a>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.55 }}
              className="text-sm text-slate-400"
            >
              Free forever · No credit card · Open platform
            </motion.p>
          </div>

          {/* Right — CSS animated sphere */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="hidden lg:flex items-center justify-center"
            style={{ perspective: 800 }}
          >
            <OrbitingSphere />
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
      >
        <span className="text-xs text-slate-400">Scroll</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="h-5 w-5 text-slate-300" />
        </motion.div>
      </motion.div>
    </section>
  );
}
