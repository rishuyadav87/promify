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
  // High contrast white text with gradient and glow
  primary:
    "bg-gradient-teal text-white shadow-glow-sm hover:shadow-glow-teal hover:scale-[1.02] active:scale-[0.99]",
  // Brick gradient with crisp white text
  secondary:
    "bg-gradient-brick text-white shadow-[0_0_12px_rgba(220,85,45,0.35)] hover:shadow-glow-brick hover:scale-[1.02] active:scale-[0.99]",
  // Glass outline with crisp white text
  outline:
    "border border-white/20 text-white bg-white/5 hover:bg-white/10 hover:border-white/35 active:bg-white/15 backdrop-blur-sm",
  // Ghost variant
  ghost:
    "text-slate-300 hover:text-white hover:bg-white/10 active:bg-white/15",
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
