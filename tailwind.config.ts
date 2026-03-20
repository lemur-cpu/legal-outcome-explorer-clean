import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0f1117",
        surface: "#1a1d27",
        "surface-elevated": "#21253a",
        border: "#2a2d3e",
        accent: {
          DEFAULT: "#4f8ef7",
          hover: "#6ba3fa",
          muted: "rgba(79,142,247,0.15)",
        },
        affirmed: {
          DEFAULT: "#34d399",
          muted: "rgba(52,211,153,0.15)",
        },
        reversed: {
          DEFAULT: "#f87171",
          muted: "rgba(248,113,113,0.15)",
        },
        highlight: {
          DEFAULT: "#fbbf24",
          muted: "rgba(251,191,36,0.15)",
        },
        text: {
          primary: "#f0f2f8",
          secondary: "#8b90a8",
          muted: "#565a72",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        serif: ["IBM Plex Serif", "Georgia", "serif"],
        mono: ["IBM Plex Mono", "Menlo", "monospace"],
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        sm: "0.375rem",
        lg: "0.75rem",
        xl: "1rem",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "glow-accent":
          "radial-gradient(ellipse at top, rgba(79,142,247,0.15) 0%, transparent 70%)",
      },
      boxShadow: {
        glow: "0 0 20px rgba(79,142,247,0.25)",
        "glow-sm": "0 0 10px rgba(79,142,247,0.15)",
        card: "0 4px 24px rgba(0,0,0,0.4)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.4s cubic-bezier(0.16,1,0.3,1)",
        "scale-in": "scaleIn 0.3s cubic-bezier(0.16,1,0.3,1)",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
