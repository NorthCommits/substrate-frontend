"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { CheckCircle2, Loader2, LockOpen, MailCheck } from "lucide-react";
import { forgotPassword } from "@/lib/auth";

const bullets = [
  "Register your agents in seconds",
  "Publish and subscribe to context",
  "Watch your agents work together live",
];

type Step = "email" | "sent";

function ForgotPasswordForm() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) { setError("Please enter your email address"); return; }
    setError("");
    setLoading(true);
    try {
      await forgotPassword(email.trim());
      setStep("sent");
    } catch (err) {
      const msg = (err as { message?: string })?.message ?? "Something went wrong. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  if (step === "sent") {
    return (
      <div className="w-full max-w-sm flex flex-col items-center text-center">
        <div className="bg-emerald-50 p-3 rounded-xl mb-5">
          <MailCheck className="h-10 w-10 text-emerald-500" />
        </div>
        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight mb-2">
          Check your email
        </h1>
        <p className="text-sm text-slate-500 max-w-xs mb-3 leading-relaxed">
          We sent a password reset link to{" "}
          <span className="font-semibold text-indigo-600">{email}</span>.
          Click it to set a new password.
        </p>
        <p className="text-xs text-slate-400 mb-8">The link expires in 1 hour.</p>
        <p className="text-sm text-slate-500">
          Didn&apos;t receive it? Check spam or{" "}
          <button
            onClick={() => { setStep("email"); setError(""); }}
            className="text-indigo-600 hover:text-indigo-700 underline underline-offset-2 transition-colors"
          >
            try again
          </button>
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <div className="flex flex-col items-center text-center mb-8">
        <div className="bg-indigo-50 p-3 rounded-xl mb-5">
          <LockOpen className="h-10 w-10 text-indigo-600" />
        </div>
        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight mb-2">
          Forgot your password?
        </h1>
        <p className="text-sm text-slate-500">
          Enter your email address and we&apos;ll send you a reset link.
        </p>
      </div>

      <form onSubmit={handleSend} className="space-y-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">Email</label>
          <input
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(""); }}
            className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            autoComplete="email"
            autoFocus
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2.5 border border-red-100">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Sending...</> : "Send reset link"}
        </button>
      </form>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full lg:w-1/2 min-h-screen flex flex-col bg-white px-12"
      >
        <div className="absolute top-8 left-8 flex flex-col gap-2">
          <Link href="/login" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
            ← Back to login
          </Link>
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity duration-200">
            <span className="h-5 w-5 bg-indigo-600 rounded-md inline-block flex-shrink-0" aria-hidden />
            <span className="font-bold text-slate-900 tracking-tight">Substrate</span>
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <ForgotPasswordForm />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.05 }}
        className="hidden lg:flex lg:w-1/2 min-h-screen bg-indigo-600 flex-col justify-between p-12 relative overflow-hidden"
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(99,102,241,0.4) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-16">
            <span className="h-6 w-6 bg-white/20 rounded-md inline-block" aria-hidden />
            <span className="font-bold text-white text-lg tracking-tight">Substrate</span>
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight mb-4 leading-tight">
            Build smarter agents, together
          </h2>
          <ul className="space-y-4 mt-8">
            {bullets.map((b) => (
              <li key={b} className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-indigo-200 flex-shrink-0" />
                <span className="text-indigo-100 text-sm">{b}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="relative z-10 bg-indigo-700 rounded-lg p-5">
          <p className="text-indigo-100 text-sm italic leading-relaxed mb-3">
            &ldquo;Substrate changed how our agents communicate. Context flows instantly — no more starting from zero.&rdquo;
          </p>
          <footer className="text-indigo-300 text-xs">— AI Engineer, Stealth Startup</footer>
        </div>
      </motion.div>
    </div>
  );
}
