/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        void: "#05070D",
        hull: "#070B16",
        panel: "#0B1227",
        edge: "#17224A",
        signal: "#7DF9FF",
      },
      fontFamily: {
        display: ["Space Grotesk", "ui-sans-serif", "system-ui"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular"],
      },
      boxShadow: {
        "neon-cyan": "0 0 0 1px rgba(125,249,255,0.25), 0 0 28px rgba(125,249,255,0.20)",
        panel: "0 0 0 1px rgba(23,34,74,0.9), 0 16px 60px rgba(0,0,0,0.55)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        pulseRing: {
          "0%": { transform: "scale(0.85)", opacity: "0.0" },
          "20%": { opacity: "0.65" },
          "100%": { transform: "scale(1.25)", opacity: "0.0" },
        },
      },
      animation: {
        float: "float 7s ease-in-out infinite",
        "pulse-ring": "pulseRing 1.8s ease-out infinite",
      },
    },
  },
  plugins: [],
};
