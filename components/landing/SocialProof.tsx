"use client";
import { motion } from "framer-motion";

export function SocialProof() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5 }}
      className="border-y border-slate-100 bg-slate-50 py-5"
    >
      <div className="max-w-5xl mx-auto px-6 flex items-center justify-center">
        <span className="text-sm text-slate-400 text-center">
          Trusted by AI engineers building the next generation of agents
        </span>
      </div>
    </motion.section>
  );
}
