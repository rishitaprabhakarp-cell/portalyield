import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#111318",
        muted: "#5d636b",
        line: "#e4e8e6",
        mint: {
          50: "#f1f7f4",
          100: "#e3efea",
          200: "#cfe5dc",
        },
        lilac: {
          50: "#f5f1ff",
          100: "#ece5ff",
          300: "#cbb4ff",
          500: "#9b78f0",
        },
        aqua: "#79e0cc",
        gain: "#1f9d6f",
      },
      fontFamily: {
        sans: ["'Instrument Sans'", "Arial", "sans-serif"],
      },
      letterSpacing: {
        display: "-0.04em",
      },
    },
  },
  plugins: [],
};

export default config;
