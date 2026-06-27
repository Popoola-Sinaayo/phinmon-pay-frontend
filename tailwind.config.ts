import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "ui-serif", "serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      colors: {
        // Signature: a confident "money & trust" green  reserved for accents & key CTAs
        primary: {
          50: "#eefaf2",
          100: "#d4f2de",
          200: "#a8e4bf",
          300: "#71d09b",
          400: "#3eb578",
          500: "#1f9d63",
          600: "#107a4c",
          700: "#0e6340",
          800: "#0d4f35",
          900: "#0b412d",
        },
        // Calm teal  quiet support accent (badges, secondary highlights)
        secondary: {
          50: "#eef6f5",
          100: "#d3e9e7",
          200: "#a9d4d0",
          500: "#0f766e",
          600: "#115e59",
          700: "#134e4a",
        },
        // Warm paper canvas  replaces cold grays for an editorial feel
        paper: {
          DEFAULT: "#fbfaf7",
          100: "#f6f3ee",
          200: "#ece7dd",
          300: "#ddd6c8",
        },
        // Warm graphite ink  for text & dark feature blocks (not cold black)
        ink: {
          500: "#57534e",
          600: "#44403c",
          700: "#33302c",
          800: "#23211e",
          900: "#1a1815",
          950: "#121110",
        },
        warning: { 500: "#e0852f", 600: "#c46f1f" },
        error: { 500: "#dc5b53", 600: "#c2453f" },
      },
      borderRadius: {
        card: "20px",
        btn: "14px",
        input: "12px",
        modal: "24px",
        pill: "9999px",
      },
      maxWidth: {
        landing: "1200px",
        dashboard: "1440px",
        form: "640px",
        survey: "780px",
      },
      boxShadow: {
        subtle: "0 1px 2px 0 rgb(26 24 21 / 0.04), 0 1px 1px -1px rgb(26 24 21 / 0.03)",
        card: "0 8px 24px -12px rgb(26 24 21 / 0.12), 0 2px 6px -3px rgb(26 24 21 / 0.06)",
        lift: "0 18px 40px -18px rgb(26 24 21 / 0.22)",
        glow: "0 0 0 1px rgb(31 157 99 / 0.12), 0 16px 36px -16px rgb(16 122 76 / 0.30)",
        ring: "0 0 0 4px rgb(31 157 99 / 0.12)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "slide-up": "slideUp 0.5s ease-out forwards",
        float: "float 7s ease-in-out infinite",
        shimmer: "shimmer 2.2s linear infinite",
        "pulse-soft": "pulseSoft 2.4s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
