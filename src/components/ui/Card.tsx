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
      className={`w-full rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] backdrop-blur-xl dark:border-white/[0.08] dark:bg-surface/70 dark:shadow-card sm:p-8 ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}
