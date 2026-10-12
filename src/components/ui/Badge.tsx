import type { ReactNode } from "react";

type Variant = "brick" | "teal" | "neutral" | "gold" | "success" | "error";

const variants: Record<Variant, string> = {
  brick:
    "bg-[#34160C] text-[#FF8566] border border-[#DC552D]/40 shadow-[0_0_10px_rgba(220,85,45,0.2)]",
  teal:
    "bg-[#0A2A27] text-[#4EE5D5] border border-[#38B9AC]/40 shadow-[0_0_10px_rgba(56,185,172,0.2)]",
  neutral:
    "bg-white/10 text-slate-200 border border-white/15",
  gold:
    "text-[#FFD166] border border-yellow-500/40 bg-yellow-950/40 shadow-[0_0_10px_rgba(201,151,58,0.25)]",
  success:
    "bg-emerald-950/40 text-emerald-400 border border-emerald-500/40",
  error:
    "bg-rose-950/40 text-rose-400 border border-rose-500/40",
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
