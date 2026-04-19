"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import { Check, Copy, CheckCircle2 } from "lucide-react";

type Tab = "register" | "publish" | "subscribe";

const tabs: { id: Tab; label: string }[] = [
  { id: "register", label: "Register Agent" },
  { id: "publish", label: "Publish Context" },
  { id: "subscribe", label: "Subscribe" },
];

type Token = { type: "keyword" | "string" | "comment" | "fn" | "plain"; text: string };

function tokenize(code: string): Token[] {
  const result: Token[] = [];
  let last = 0;

  const patterns: { re: RegExp; type: Token["type"] }[] = [
    { re: /#[^\n]*/g, type: "comment" },
    { re: /"""[\s\S]*?"""|"[^"]*"|'[^']*'/g, type: "string" },
    { re: /\b(import|from|as|def|return|print|if|for|in)\b/g, type: "keyword" },
    { re: /\b(requests|response|agent|rag_agent|translation_agent)\b/g, type: "plain" },
    { re: /\b(post|json|get)\b/g, type: "fn" },
  ];

  const allMatches: { index: number; end: number; type: Token["type"]; text: string }[] = [];
  for (const { re, type } of patterns) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(code)) !== null) {
      allMatches.push({ index: m.index, end: m.index + m[0].length, type, text: m[0] });
    }
  }
  allMatches.sort((a, b) => a.index - b.index);

  const used = new Set<number>();
  for (const match of allMatches) {
    if (used.has(match.index)) continue;
    if (match.index > last) result.push({ type: "plain", text: code.slice(last, match.index) });
    result.push({ type: match.type, text: match.text });
    last = match.end;
    for (let i = match.index; i < match.end; i++) used.add(i);
  }
  if (last < code.length) result.push({ type: "plain", text: code.slice(last) });
  return result;
}

const tokenColors: Record<Token["type"], string> = {
  keyword: "text-indigo-400",
  string: "text-emerald-400",
  comment: "text-slate-500",
  fn: "text-yellow-300",
  plain: "text-slate-300",
};

const codeContent: Record<Tab, string> = {
  register: `import requests

response = requests.post(
    "https://substrate-backend.onrender.com/agents/",
    headers={"X-API-Key": "sk_live_your_key"},
    json={
        "name": "Translation Agent",
        "description": "Handles multilingual translation"
    }
)
agent = response.json()
print(f"Agent registered: {agent['id']}")`,

  publish: `requests.post(
    "https://substrate-backend.onrender.com/context/publish",
    headers={"X-API-Key": "sk_live_your_key"},
    params={"agent_id": agent["id"]},
    json={
        "key": "translation_result",
        "value": {
            "source": "en",
            "target": "es",
            "text": "Hola mundo",
            "confidence": 0.97
        },
        "context_type": "translation_output",
        "visibility": "public"
    }
)`,

  subscribe: `requests.post(
    "https://substrate-backend.onrender.com/subscriptions/",
    headers={"X-API-Key": "sk_live_your_key"},
    json={
        "agent_id": rag_agent["id"],
        "context_type": "translation_output",
        "producer_id": translation_agent["id"]
    }
)`,
};

function HighlightedCode({ code }: { code: string }) {
  const tokens = tokenize(code);
  return (
    <code className="text-sm font-mono leading-relaxed block whitespace-pre">
      {tokens.map((t, i) => (
        <span key={i} className={tokenColors[t.type]}>
          {t.text}
        </span>
      ))}
    </code>
  );
}

export function CodeSnippet() {
  const [activeTab, setActiveTab] = useState<Tab>("register");
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(codeContent[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section className="bg-slate-950 py-24">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left — text */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-white tracking-tight mb-4">
              Connect in minutes, not days
            </h2>
            <p className="text-slate-400 leading-relaxed mb-10">
              No SDK. No complex setup. Just HTTP. Works with Python, Node, Rust, Go —
              anything that can make an HTTP request.
            </p>

            <div className="space-y-4 mb-10">
              {[
                "Register your account",
                "Generate an API key",
                "Publish your first context",
              ].map((step) => (
                <div key={step} className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-indigo-400 flex-shrink-0" />
                  <span className="text-slate-300">{step}</span>
                </div>
              ))}
            </div>

            <a
              href="https://substrate-backend.onrender.com/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400 hover:text-indigo-300 transition-colors text-sm flex items-center gap-1"
            >
              Read the docs →
            </a>
          </motion.div>

          {/* Right — tabbed code block */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
              {/* Tab bar */}
              <div className="flex items-center border-b border-slate-700 px-4 gap-0">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? "border-indigo-600 text-white"
                        : "border-transparent text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
                <button
                  onClick={handleCopy}
                  className="ml-auto flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors py-3"
                >
                  {copied ? (
                    <><Check className="h-3.5 w-3.5 text-emerald-400" /><span className="text-emerald-400">Copied!</span></>
                  ) : (
                    <><Copy className="h-3.5 w-3.5" />Copy</>
                  )}
                </button>
              </div>
              {/* Code */}
              <div className="px-5 py-5 overflow-x-auto min-h-[220px]">
                <HighlightedCode code={codeContent[activeTab]} />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
