import type { ReactNode } from "react";

type Variant = "brick" | "teal" | "neutral" | "gold" | "success" | "error";

// brick = tier1, teal = tier2, gold = premium/price — keeps the same
// two-sided color logic used everywhere else while adding richer styling
const variants: Record<Variant, string> = {
  brick:
    "bg-brick-subtle/80 text-brick border border-brick/20 shadow-[0_0_8px_rgba(220,85,45,0.15)]",
  teal:
    "bg-teal-subtle/80 text-teal border border-teal/20 shadow-[0_0_8px_rgba(56,185,172,0.15)]",
  neutral:
    "bg-ink/8 text-warmgray border border-ink/10",
  gold:
    "text-gradient-gold border border-yellow-500/25 bg-yellow-900/20 shadow-[0_0_8px_rgba(201,151,58,0.2)]",
  success:
    "bg-success/15 text-success border border-success/25",
  error:
    "bg-error/15 text-error border border-error/25",
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
