"use client";
import Link from "next/link";

const cols = [
  {
    heading: null,
    brand: true,
    links: [],
  },
  {
    heading: "Product",
    brand: false,
    links: [
      { label: "Features", href: "#" },
      { label: "Graph", href: "/signup" },
      { label: "Directory", href: "/signup" },
      { label: "Pricing", href: "#" },
    ],
  },
  {
    heading: "Developers",
    brand: false,
    links: [
      { label: "Docs", href: "/docs" },
      { label: "API Reference", href: "/docs" },
      { label: "GitHub", href: "https://github.com" },
      { label: "Changelog", href: "#" },
    ],
  },
  {
    heading: "Company",
    brand: false,
    links: [
      { label: "About", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Twitter", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-white border-t border-slate-100">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Brand column */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="h-5 w-5 bg-indigo-600 rounded-md inline-block flex-shrink-0" aria-hidden />
              <span className="font-bold text-slate-900 tracking-tight">Substrate</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              The memory layer for multi-agent AI.
            </p>
            <p className="text-sm text-slate-400">© 2026 Substrate</p>
          </div>

          {cols.slice(1).map((col) => (
            <div key={col.heading}>
              <p className="text-xs font-semibold text-slate-900 uppercase tracking-widest mb-4">
                {col.heading}
              </p>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
                      target={link.href.startsWith("http") ? "_blank" : undefined}
                      rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-100 pt-6">
          <p className="text-xs text-slate-300 text-center">
            Built with FastAPI · PostgreSQL · Redis · OpenAI
          </p>
        </div>
      </div>
    </footer>
  );
}
