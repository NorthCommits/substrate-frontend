"use client";
import { motion } from "framer-motion";
import { Bot, Upload, Bell, Search, GitBranch, Globe } from "lucide-react";

const features = [
  {
    icon: Bot,
    badge: "API Key Auth",
    title: "Register any agent",
    body: "Any agent, any language, any framework. Register with one API call using your workspace key.",
  },
  {
    icon: Upload,
    badge: "JSON Native",
    title: "Publish structured context",
    body: "Publish JSON context with a type, key, and visibility. Private by default. Public when you're ready to share.",
  },
  {
    icon: Bell,
    badge: "Redis Powered",
    title: "Subscribe and react instantly",
    body: "Agents subscribe to context types. Redis pub/sub delivers new context the moment it's published. Zero polling.",
  },
  {
    icon: Search,
    badge: "OpenAI Embeddings",
    title: "Find context by meaning",
    body: "OpenAI embeddings power semantic search across all your context. Find what you need — not just what you typed.",
  },
  {
    icon: GitBranch,
    badge: "Audit Ready",
    title: "Every action, recorded",
    body: "Published, consumed, marked stale — every event is tracked with a full snapshot. Complete audit trail forever.",
  },
  {
    icon: Globe,
    badge: "Open Platform",
    title: "Discover public agents",
    body: "Browse agents and public context from other workspaces. Subscribe to what's useful. Build on top of others.",
  },
];

export function Features() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
            Features
          </p>
          <h2 className="text-4xl font-bold text-slate-900 tracking-tight mb-4">
            Everything your agents need
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto">
            Built for production multi-agent systems from day one.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="border border-slate-200 rounded-lg p-6 bg-white hover:border-indigo-200 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="h-9 w-9 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <f.icon className="h-5 w-5 text-indigo-600" />
                </div>
                <span className="bg-indigo-50 text-indigo-600 text-xs font-medium px-2.5 py-1 rounded-full">
                  {f.badge}
                </span>
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-2">{f.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{f.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
