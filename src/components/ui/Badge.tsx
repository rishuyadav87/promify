import type { ReactNode } from "react";

type Variant = "brick" | "teal" | "neutral";

// brick = tier1, teal = tier2 — keeps the same two-sided color logic
// used everywhere else, rather than inventing a third accent for tiers
const variants: Record<Variant, string> = {
  brick: "bg-brick-subtle text-brick",
  teal: "bg-teal-subtle text-teal",
  neutral: "bg-ink/5 text-warmgray",
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
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium uppercase tracking-wide ${variants[variant]}`}
    >
      {children}
    </span>
  );
}
