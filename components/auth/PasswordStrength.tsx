"use client";

interface PasswordStrengthProps {
  password: string;
}

function getStrength(password: string): { level: 0 | 1 | 2 | 3; label: string } {
  if (password.length === 0) return { level: 0, label: "" };
  if (password.length < 8) return { level: 1, label: "Weak" };
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*]/.test(password);
  if (hasNumber && hasSpecial) return { level: 3, label: "Strong" };
  return { level: 2, label: "Fair" };
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const { level, label } = getStrength(password);

  if (level === 0) return null;

  const bars = [
    level >= 1 ? (level === 1 ? "bg-red-400" : level === 2 ? "bg-amber-400" : "bg-emerald-500") : "bg-slate-100",
    level >= 2 ? (level === 2 ? "bg-amber-400" : "bg-emerald-500") : "bg-slate-100",
    level >= 3 ? "bg-emerald-500" : "bg-slate-100",
  ];

  const labelColor =
    level === 1 ? "text-red-500" : level === 2 ? "text-amber-500" : "text-emerald-600";

  return (
    <div className="flex items-center gap-2 mt-1.5">
      <div className="flex gap-1 flex-1">
        {bars.map((cls, i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-colors duration-300 ${cls}`} />
        ))}
      </div>
      <span className={`text-xs font-medium ${labelColor}`}>{label}</span>
    </div>
  );
}
