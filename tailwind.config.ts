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
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        stone: "rgb(var(--color-stone) / <alpha-value>)",
        warmgray: "rgb(var(--color-warmgray) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        brick: {
          DEFAULT: "rgb(var(--color-brick) / <alpha-value>)",
          hover: "rgb(var(--color-brick-hover) / <alpha-value>)",
          subtle: "rgb(var(--color-brick-subtle) / <alpha-value>)",
        },
        teal: {
          DEFAULT: "rgb(var(--color-teal) / <alpha-value>)",
          hover: "rgb(var(--color-teal-hover) / <alpha-value>)",
          subtle: "rgb(var(--color-teal-subtle) / <alpha-value>)",
        },
        success: "rgb(var(--color-success) / <alpha-value>)",
        error: "rgb(var(--color-error) / <alpha-value>)",
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },
    },
  },
  plugins: [],
};

export default config;
