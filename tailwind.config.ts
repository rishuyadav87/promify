import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ink:      "rgb(var(--color-ink)      / <alpha-value>)",
        stone:    "rgb(var(--color-stone)    / <alpha-value>)",
        warmgray: "rgb(var(--color-warmgray) / <alpha-value>)",
        surface:  "rgb(var(--color-surface)  / <alpha-value>)",
        surface2: "rgb(var(--color-surface2) / <alpha-value>)",
        brick: {
          DEFAULT: "rgb(var(--color-brick)        / <alpha-value>)",
          hover:   "rgb(var(--color-brick-hover)  / <alpha-value>)",
          subtle:  "rgb(var(--color-brick-subtle) / <alpha-value>)",
        },
        teal: {
          DEFAULT: "rgb(var(--color-teal)        / <alpha-value>)",
          hover:   "rgb(var(--color-teal-hover)  / <alpha-value>)",
          subtle:  "rgb(var(--color-teal-subtle) / <alpha-value>)",
        },
        success: "rgb(var(--color-success) / <alpha-value>)",
        error:   "rgb(var(--color-error)   / <alpha-value>)",
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans:    ["var(--font-body)",    "system-ui", "sans-serif"],
        mono:    ["var(--font-mono)",    "ui-monospace", "monospace"],
      },
      screens: {
        sm:  "640px",
        md:  "768px",
        lg:  "1024px",
        xl:  "1280px",
        "2xl": "1536px",
      },
      /* Premium gradients as named background-image values */
      backgroundImage: {
        "gradient-teal":   "linear-gradient(135deg, #1a9e94, #38B9AC)",
        "gradient-brick":  "linear-gradient(135deg, #b8360e, #DC552D)",
        "gradient-teal-v": "linear-gradient(180deg, #0a2a27 0%, #0f3d38 100%)",
        "gradient-brick-v":"linear-gradient(180deg, #2a1008 0%, #3d1a0a 100%)",
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":  "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "shimmer": "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)",
      },
      /* Premium box shadows */
      boxShadow: {
        "glow-teal":   "0 0 20px rgba(56,185,172,0.35), 0 0 60px rgba(56,185,172,0.12)",
        "glow-brick":  "0 0 20px rgba(220,85,45,0.35),  0 0 60px rgba(220,85,45,0.12)",
        "glow-sm":     "0 0 8px  rgba(56,185,172,0.25)",
        "card":        "0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)",
        "card-hover":  "0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)",
        "inner-glow":  "inset 0 1px 0 rgba(255,255,255,0.08)",
      },
      /* Fine-grained border radius */
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      /* Backdrop blur values */
      backdropBlur: {
        xs:  "2px",
        "2xl": "40px",
      },
      /* Animation extras */
      animation: {
        "pulse-glow":   "pulse-glow-teal  2s cubic-bezier(0.4,0,0.6,1) infinite",
        shimmer:        "shimmer 2s linear infinite",
        "fade-in":      "fadeIn 0.4s ease-out",
        "slide-up":     "slideUp 0.4s ease-out",
      },
      keyframes: {
        "pulse-glow-teal": {
          "0%, 100%": { boxShadow: "0 0 12px rgba(56,185,172,0.4)" },
          "50%":       { boxShadow: "0 0 28px rgba(56,185,172,0.7)" },
        },
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%":   { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition:  "200% center" },
        },
      },
    },
  },
  plugins: [],
};

export default config;