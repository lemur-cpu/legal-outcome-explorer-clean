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
        background:         "#f8f6f1",   // warm off-white, aged paper
        surface:            "#ffffff",   // pure white cards
        "surface-2":        "#f0ede6",   // warmer nested surface
        "surface-elevated": "#f0ede6",   // kept for compatibility
        border:             "#e2ddd6",   // warm gray border
        accent: {
          DEFAULT: "#1a4b8c",            // deep navy blue
          hover:   "#1e5799",
          muted:   "rgba(26,75,140,0.10)",
          light:   "#e8eef7",
        },
        affirmed: {
          DEFAULT: "#166534",            // muted deep green
          muted:   "rgba(22,101,52,0.10)",
        },
        reversed: {
          DEFAULT: "#991b1b",            // muted deep red
          muted:   "rgba(153,27,27,0.10)",
        },
        remanded: {
          DEFAULT: "#92400e",            // muted amber-brown
          muted:   "rgba(146,64,14,0.10)",
        },
        highlight: {
          DEFAULT: "#ca8a04",
          muted:   "rgba(202,138,4,0.10)",
          bg:      "#fef9c3",
        },
        text: {
          primary:   "#1c1917",
          secondary: "#57534e",
          muted:     "#a8a29e",
        },
        // Dark header — stays dark regardless of mode
        "header-bg":   "#0f1117",
        "header-text": "#e2e8f0",
      },
      fontFamily: {
        sans:  ["Inter", "system-ui", "sans-serif"],
        serif: ["IBM Plex Serif", "Georgia", "serif"],
        mono:  ["IBM Plex Mono", "Menlo", "monospace"],
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        sm:      "0.375rem",
        lg:      "0.75rem",
        xl:      "1rem",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "glow-accent":
          "radial-gradient(ellipse at top, rgba(26,75,140,0.08) 0%, transparent 70%)",
      },
      boxShadow: {
        glow:      "0 0 20px rgba(26,75,140,0.15)",
        "glow-sm": "0 0 10px rgba(26,75,140,0.10)",
        card:      "0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.05)",
      },
      animation: {
        "fade-in":  "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.4s cubic-bezier(0.16,1,0.3,1)",
        "scale-in": "scaleIn 0.3s cubic-bezier(0.16,1,0.3,1)",
      },
      keyframes: {
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%":   { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%":   { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
