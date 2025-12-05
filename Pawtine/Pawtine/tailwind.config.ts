import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paw: {
          primary: "#6C5CE7",
          secondary: "#A29BFE",
          accent: "#FD79A8",
          background: "#F8F9FF",
        },
      },
      borderRadius: {
        paw: "24px",
      },
    },
  },
  plugins: [],
};

export default config;
