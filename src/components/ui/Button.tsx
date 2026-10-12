import Link from "next/link";
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

type Variant = "primary" | "secondary" | "outline" | "ghost";

const base =
  "inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-teal focus-visible:ring-offset-stone disabled:pointer-events-none disabled:opacity-40 relative overflow-hidden";

const variants: Record<Variant, string> = {
  primary:
    "bg-gradient-teal text-white font-semibold shadow-sm hover:shadow-glow-teal hover:scale-[1.02] active:scale-[0.99]",
  secondary:
    "bg-gradient-brick text-white font-semibold shadow-sm hover:shadow-glow-brick hover:scale-[1.02] active:scale-[0.99]",
  outline:
    "border border-slate-300 text-slate-800 bg-white/80 hover:bg-slate-100 dark:border-white/20 dark:text-white dark:bg-white/5 dark:hover:bg-white/10 backdrop-blur-sm",
  ghost:
    "text-slate-600 hover:text-black hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/10",
};

type CommonProps = {
  variant?: Variant;
  className?: string;
  children: ReactNode;
};

type ButtonAsButton = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type ButtonAsLink = CommonProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

export function Button({
  variant = "primary",
  className = "",
  children,
  href,
  ...props
}: ButtonAsButton | ButtonAsLink) {
  const classes = `${base} ${variants[variant]} ${className}`;

  if (href) {
    return (
      <Link
        href={href}
        className={classes}
        {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      className={classes}
      {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  );
}
