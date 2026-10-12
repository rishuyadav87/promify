import Link from "next/link";
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

type Variant = "primary" | "secondary" | "outline" | "ghost";

const base =
  "inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-teal focus-visible:ring-offset-stone disabled:pointer-events-none disabled:opacity-40 relative overflow-hidden";

const variants: Record<Variant, string> = {
  // Gradient fill with glow on hover
  primary:
    "bg-gradient-teal text-stone shadow-glow-sm hover:shadow-glow-teal hover:scale-[1.02] active:scale-[0.99] active:opacity-90",
  // Brick gradient
  secondary:
    "bg-gradient-brick text-stone shadow-[0_0_8px_rgba(220,85,45,0.25)] hover:shadow-glow-brick hover:scale-[1.02] active:scale-[0.99] active:opacity-90",
  // Glass outline
  outline:
    "border border-ink/20 text-ink bg-transparent hover:bg-ink/8 hover:border-ink/35 active:bg-ink/12 backdrop-blur-sm",
  // Completely transparent
  ghost:
    "text-warmgray hover:text-ink hover:bg-ink/6 active:bg-ink/10",
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
