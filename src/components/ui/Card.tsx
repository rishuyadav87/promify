import type { CSSProperties, ReactNode } from "react";

export function Card({
  className = "",
  style,
  children,
}: {
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <div
      className={`w-full rounded-2xl border border-ink/[0.08] bg-surface/70 p-6 shadow-card backdrop-blur-xl sm:p-8 ${className}`}
      style={{
        boxShadow:
          "0 4px 24px rgba(0,0,0,0.45), inset 0 1px 0 rgba(240,237,232,0.05)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
