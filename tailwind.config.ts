import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        teal: {
          deep: "#0C5C4C",
          DEFAULT: "#12735F",
          light: "#E1F0EB",
        },
        marigold: {
          DEFAULT: "#E8983D",
          dark: "#B9721F",
        },
        ink: "#16231F",
        inksoft: "#55655F",
        mint: "#F3F8F6",
        line: "#DCE7E1",
        redx: "#C4453E",
      },
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        sans: ["Inter", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      borderRadius: {
        xl2: "14px",
      },
    },
  },
  plugins: [],
};

export default config;
