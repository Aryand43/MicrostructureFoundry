import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx,mdx}",
    "./features/**/*.{ts,tsx,mdx}",
    "./components/**/*.{ts,tsx,mdx}",
    "./lib/**/*.{ts,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        "micro-bg": "#050608",
        "micro-bg-soft": "#10131a",
        "micro-border": "#242a35",
        "micro-accent": "#6fa7ff"
      }
    }
  }
};

export default config;
