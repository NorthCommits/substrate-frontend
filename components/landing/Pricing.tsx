"use client";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

const features = [
  "Unlimited agents",
  "Unlimited context publishing",
  "Unlimited subscriptions",
  "Real-time pub/sub via Redis",
  "Semantic search via OpenAI",
  "Full lineage tracking",
  "Public directory access",
  "API key management",
  "Workspace isolation",
];

export function Pricing() {
  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-slate-900 tracking-tight mb-4">
            Simple, honest pricing
          </h2>
          <p className="text-slate-500">Start free. Stay free. Upgrade when you&apos;re ready.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-md mx-auto border-2 border-indigo-200 rounded-xl p-8 bg-white shadow-sm"
        >
          <div className="text-center mb-6">
            <span className="inline-block bg-emerald-50 text-emerald-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
              Free Forever
            </span>
            <div className="flex items-end justify-center gap-1">
              <span className="text-6xl font-bold text-slate-900">$0</span>
              <span className="text-slate-400 mb-2">/month</span>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6 mb-6">
            <div className="space-y-3">
              {features.map((f) => (
                <div key={f} className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  <span className="text-sm text-slate-700">{f}</span>
                </div>
              ))}
            </div>
          </div>

          <Link href="/signup">
            <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm py-3 rounded-lg transition-colors">
              Get started free
            </button>
          </Link>

          <p className="text-xs text-slate-400 text-center mt-4">
            Paid plans coming soon for teams
          </p>
        </motion.div>
      </div>
    </section>
  );
}
