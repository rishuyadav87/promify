import type { ReactNode } from "react";

type Variant = "brick" | "teal" | "neutral" | "gold" | "success" | "error";

const variants: Record<Variant, string> = {
  brick:
    "bg-orange-50 text-orange-700 border border-orange-200 dark:bg-[#34160C] dark:text-[#FF8566] dark:border-[#DC552D]/40 shadow-sm dark:shadow-[0_0_10px_rgba(220,85,45,0.2)]",
  teal:
    "bg-teal-50 text-teal-800 border border-teal-200 dark:bg-[#0A2A27] dark:text-[#4EE5D5] dark:border-[#38B9AC]/40 shadow-sm dark:shadow-[0_0_10px_rgba(56,185,172,0.2)]",
  neutral:
    "bg-slate-100 text-slate-700 border border-slate-200 dark:bg-white/10 dark:text-slate-200 dark:border-white/15",
  gold:
    "bg-amber-50 text-amber-800 border border-amber-200 dark:text-[#FFD166] dark:border-yellow-500/40 dark:bg-yellow-950/40",
  success:
    "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-500/40",
  error:
    "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-500/40",
};

export function Badge({
  variant = "neutral",
  children,
}: {
  variant?: Variant;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm ${variants[variant]}`}
    >
      {children}
    </span>
  );
}
