import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  tone?: "primary" | "secondary" | "ghost";
};

const toneClasses: Record<NonNullable<ButtonProps["tone"]>, string> = {
  primary:
    "bg-cyan-400 text-slate-950 shadow-[0_0_0_1px_rgba(34,211,238,0.35),0_16px_30px_rgba(8,145,178,0.35)] hover:bg-cyan-300",
  secondary:
    "bg-slate-800 text-slate-100 border border-slate-700 hover:bg-slate-700",
  ghost: "bg-transparent text-slate-200 hover:bg-white/5",
};

export function Button({
  className,
  children,
  tone = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-50",
        toneClasses[tone],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
