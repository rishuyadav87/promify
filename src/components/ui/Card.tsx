import type { ReactNode } from "react";

export function Card({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`w-full rounded-lg border border-ink/10 bg-surface/70 p-6 shadow-sm sm:p-8 ${className}`}
    >
      {children}
    </div>
  );
}
