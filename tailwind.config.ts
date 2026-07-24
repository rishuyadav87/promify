import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {ink: "#201D1A",
stone: "#F3EFE8",
warmgray: "#8A8478",
brick: {
  DEFAULT: "#B5482F",
  hover: "#9C3C27",
  subtle: "#F5E4DE",
},
teal: {
  DEFAULT: "#1B4A47",
  hover: "#143735",
  subtle: "#DCE8E7",
},
success: "#3D7A54",
error: "#B0463A",
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      // Screens are the default Tailwind breakpoints (sm/md/lg/xl/2xl) —
      // kept explicit here as a reminder that every page in this app
      // should be styled mobile-first and checked at each breakpoint.
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
