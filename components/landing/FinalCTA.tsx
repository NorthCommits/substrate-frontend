"use client";
import { motion } from "framer-motion";
import Link from "next/link";

export function FinalCTA() {
  return (
    <section className="py-32 bg-indigo-600">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto px-6 text-center"
      >
        <h2 className="text-5xl font-bold text-white tracking-tight mb-6 leading-tight">
          Ready to give your agents a memory?
        </h2>
        <p className="text-xl text-indigo-200 mb-10 leading-relaxed">
          Join developers building the next generation of multi-agent AI systems on Substrate.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/signup">
            <button className="bg-white text-indigo-600 font-semibold px-8 py-3 rounded-lg hover:bg-indigo-50 transition-colors text-sm">
              Start building free
            </button>
          </Link>
          <a href="#live-stats">
            <button className="border border-white/60 text-white font-medium px-8 py-3 rounded-lg hover:bg-white/10 transition-colors text-sm">
              View live stats →
            </button>
          </a>
        </div>
      </motion.div>
    </section>
  );
}
