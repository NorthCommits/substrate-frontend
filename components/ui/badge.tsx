import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "active" | "stale" | "conflicting" | "inactive" | "outline";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        variant === "default" && "bg-slate-100 text-slate-700",
        variant === "active" && "bg-indigo-50 text-indigo-700",
        variant === "stale" && "bg-amber-50 text-amber-700",
        variant === "conflicting" && "bg-red-50 text-red-700",
        variant === "inactive" && "bg-slate-100 text-slate-500",
        variant === "outline" && "border border-slate-200 text-slate-600 bg-white",
        className
      )}
    >
      {children}
    </span>
  );
}

export function StatusDot({ status }: { status: "active" | "inactive" | "stale" | "conflicting" }) {
  return (
    <span
      className={cn(
        "inline-block h-1.5 w-1.5 rounded-full",
        status === "active" && "bg-emerald-500",
        status === "inactive" && "bg-slate-400",
        status === "stale" && "bg-amber-500",
        status === "conflicting" && "bg-red-500"
      )}
    />
  );
}
