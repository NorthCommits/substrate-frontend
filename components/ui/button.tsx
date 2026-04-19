import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-medium transition-colors duration-150 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed",
          size === "sm" && "px-3 py-1.5 text-xs",
          size === "md" && "px-3.5 py-2 text-sm",
          size === "lg" && "px-4 py-2.5 text-sm",
          variant === "primary" && "bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800",
          variant === "secondary" && "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 active:bg-slate-100",
          variant === "ghost" && "text-slate-600 hover:text-slate-900 hover:bg-slate-100 active:bg-slate-200",
          variant === "danger" && "bg-red-600 text-white hover:bg-red-700 active:bg-red-800",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
