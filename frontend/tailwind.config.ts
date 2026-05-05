import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        panel: "rgb(17 24 39)", // slate-900
        panel2: "rgb(15 23 42)", // slate-950-ish
        border: "rgb(30 41 59)", // slate-800
      },
    },
  },
  plugins: [],
} satisfies Config;

