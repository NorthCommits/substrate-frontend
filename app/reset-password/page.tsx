"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { resetPassword } from "@/lib/auth";
import { PasswordStrength } from "@/components/auth/PasswordStrength";

const bullets = [
  "Register your agents in seconds",
  "Publish and subscribe to context",
  "Watch your agents work together live",
];

function PasswordField({
  label,
  value,
  onChange,
  onBlur,
  error,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  error?: string;
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          placeholder={placeholder ?? "••••••••"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          className={`w-full rounded-lg border px-4 py-3 pr-11 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
            error ? "border-red-400" : "border-slate-200"
          }`}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const [validSession, setValidSession] = useState(false);
  const [checking, setChecking] = useState(true);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setValidSession(true);
      setChecking(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (session && !validSession)) {
        setValidSession(true);
        setChecking(false);
      }
    });

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleConfirmBlur() {
    if (confirmPassword && confirmPassword !== newPassword) {
      setConfirmError("Passwords do not match");
    } else {
      setConfirmError("");
    }
  }

  const passwordReady = newPassword.length >= 8;
  const confirmReady = confirmPassword === newPassword && confirmPassword.length > 0;
  const canSubmit = passwordReady && confirmReady && !loading;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setError("");
    setLoading(true);
    try {
      await resetPassword(newPassword);
      localStorage.removeItem("substrate_reset_email");
      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch (err) {
      setError((err as { message?: string })?.message ?? "Failed to reset password");
    } finally {
      setLoading(false);
    }
  }

  const formContent = () => {
    if (checking) {
      return (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      );
    }

    if (!validSession) {
      return (
        <div className="w-full max-w-sm flex flex-col items-center text-center">
          <div className="bg-red-50 p-3 rounded-xl mb-5">
            <ShieldCheck className="h-10 w-10 text-red-400" />
          </div>
          <h1 className="text-xl font-semibold text-slate-900 mb-2">Invalid or expired link</h1>
          <p className="text-sm text-slate-500 mb-6">
            This password reset link is no longer valid.
          </p>
          <Link
            href="/forgot-password"
            className="text-sm text-indigo-600 hover:text-indigo-700 underline underline-offset-2 transition-colors"
          >
            Request a new reset link →
          </Link>
        </div>
      );
    }

    if (success) {
      return (
        <div className="w-full max-w-sm flex flex-col items-center text-center">
          <div className="bg-emerald-50 p-4 rounded-full mb-5">
            <CheckCircle2 className="h-12 w-12 text-emerald-500" />
          </div>
          <h1 className="text-xl font-semibold text-slate-900 mb-2">Password reset!</h1>
          <p className="text-sm text-slate-500 mb-2">Your password has been reset successfully.</p>
          <p className="text-xs text-slate-400">Redirecting to sign in...</p>
        </div>
      );
    }

    return (
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="bg-indigo-50 p-3 rounded-xl mb-5">
            <ShieldCheck className="h-10 w-10 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight mb-2">
            Reset your password
          </h1>
          <p className="text-sm text-slate-500">
            Choose a new password for your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <PasswordField
              label="New password"
              value={newPassword}
              onChange={setNewPassword}
              placeholder="Minimum 8 characters"
            />
            <PasswordStrength password={newPassword} />
            {newPassword.length > 0 && newPassword.length < 8 && (
              <p className="text-xs text-slate-400 mt-1">Minimum 8 characters</p>
            )}
          </div>

          <PasswordField
            label="Confirm new password"
            value={confirmPassword}
            onChange={(v) => { setConfirmPassword(v); if (confirmError) setConfirmError(""); }}
            onBlur={handleConfirmBlur}
            error={confirmError}
          />

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2.5 border border-red-100">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full py-3 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Resetting...</> : "Reset password"}
          </button>
        </form>
      </div>
    );
  };

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
          {formContent()}
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
