"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Eye, EyeOff, Loader2, MailCheck } from "lucide-react";
import { toast } from "sonner";
import { signUp } from "@/lib/auth";

const bullets = [
  "Register your agents in seconds",
  "Publish and subscribe to context",
  "Watch your agents work together live",
];

type Step = "form" | "check-email";

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("form");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});

  useEffect(() => {
    if (localStorage.getItem("substrate_token")) router.replace("/dashboard");
  }, [router]);

  function validate() {
    const e: typeof errors = {};
    if (!email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid email";
    if (!password) e.password = "Password is required";
    else if (password.length < 8) e.password = "Minimum 8 characters";
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      await signUp(email.trim(), password, fullName || undefined);
      localStorage.setItem("substrate_pending_email", email.trim());
      toast.success("Account created! Check your email to verify.");
      setStep("check-email");
    } catch (err) {
      const msg = (err as { message?: string })?.message ?? "Registration failed";
      if (msg.toLowerCase().includes("already registered")) {
        setErrors({ general: "An account with this email already exists." });
      } else {
        setErrors({ general: msg });
      }
    } finally {
      setLoading(false);
    }
  }

  const rightPanel = (
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
  );

  if (step === "check-email") {
    return (
      <div className="min-h-screen flex">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="relative w-full lg:w-1/2 min-h-screen flex flex-col bg-white px-12"
        >
          <div className="absolute top-8 left-8 flex flex-col gap-2">
            <Link href="/" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
              ← Back to home
            </Link>
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity duration-200">
              <span className="h-5 w-5 bg-indigo-600 rounded-md inline-block flex-shrink-0" aria-hidden />
              <span className="font-bold text-slate-900 tracking-tight">Substrate</span>
            </Link>
          </div>

          <div className="flex-1 flex items-center justify-center">
            <div className="w-full max-w-sm flex flex-col items-center text-center">
              <div className="bg-emerald-50 p-3 rounded-xl mb-5">
                <MailCheck className="h-10 w-10 text-emerald-500" />
              </div>
              <h1 className="text-2xl font-semibold text-slate-900 tracking-tight mb-2">
                Check your email
              </h1>
              <p className="text-sm text-slate-500 leading-relaxed mb-4 max-w-xs">
                We sent a verification link to{" "}
                <span className="font-semibold text-indigo-600">{email}</span>.
                Click the link in the email to verify your account.
              </p>
              <p className="text-xs text-slate-400 mb-8">
                Didn&apos;t receive it? Check your spam folder.
              </p>
              <button
                onClick={() => setStep("form")}
                className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
              >
                ← Back to sign up
              </button>
            </div>
          </div>
        </motion.div>
        {rightPanel}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel — indigo */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
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

      {/* Right panel — form */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.05 }}
        className="relative w-full lg:w-1/2 min-h-screen flex flex-col bg-white px-12"
      >
        <div className="absolute top-8 left-8 flex flex-col gap-2">
          <Link href="/" className="text-xs text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
            ← Back to home
          </Link>
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity duration-200 cursor-pointer">
            <span className="h-5 w-5 bg-indigo-600 rounded-md inline-block flex-shrink-0" aria-hidden />
            <span className="font-bold text-slate-900 tracking-tight">Substrate</span>
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-sm">
            <div className="mb-8">
              <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Create your account</h1>
              <p className="text-sm text-slate-500 mt-1.5">
                Already have an account?{" "}
                <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors">
                  Sign in
                </Link>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">Full Name</label>
                <input
                  type="text"
                  placeholder="Your name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">Email *</label>
                <input
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })); }}
                  className={`w-full rounded-lg border px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${errors.email ? "border-red-400" : "border-slate-200"}`}
                />
                {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 8 characters"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })); }}
                    className={`w-full rounded-lg border px-4 py-3 pr-11 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${errors.password ? "border-red-400" : "border-slate-200"}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-600">{errors.password}</p>}
              </div>

              {errors.general && (
                <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2.5 border border-red-100">
                  {errors.general}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Creating account...</> : "Create account"}
              </button>
            </form>

            <p className="text-xs text-slate-400 text-center mt-6 leading-relaxed">
              By signing up, you agree to our Terms and Privacy Policy
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
