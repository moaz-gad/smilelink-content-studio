import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Smile Link brand palette (sampled from the logo)
        brand: {
          // PRIMARY — teal from the wordmark (#476c66)
          primary: "#476c66",
          "primary-dark": "#385650",
          "primary-light": "#5f857e",
          // SECONDARY — deeper teal for headers / emphasis
          secondary: "#2f4a45",
          // ACCENT — terracotta from the tick (#b97960)
          accent: "#b97960",
          "accent-dark": "#a1604a",
          "accent-light": "#d09c88",
        },
        // NEUTRAL / BG — warm off-white
        canvas: "#f6f5f1",
        surface: "#ffffff",
        // TEXT — dark slate
        ink: "#273330",
        "ink-muted": "#6b7a76",
        line: "#e5e3dd",
      },
      boxShadow: {
        card: "0 1px 2px rgba(39, 51, 48, 0.04), 0 4px 16px rgba(39, 51, 48, 0.06)",
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.125rem",
      },
    },
  },
  plugins: [],
};

export default config;
