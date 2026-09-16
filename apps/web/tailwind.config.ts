import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          900: "#0c4a6e",
        },
        arena: {
          bg: "#121116",
          surface: "#1a1921",
          border: "#2b2933",
          muted: "#938f99",
        },
        difficulty: {
          easy: "#6dd58c",
          medium: "#ffba38",
          hard: "#f2b8b5",
        },
        // Google Material 3 (M3) Dark Theme Design Tokens
        m3: {
          surface: "#141218",
          "surface-dim": "#110f15",
          "surface-bright": "#3b383e",
          "surface-container-lowest": "#0f0d13",
          "surface-container-low": "#1d1b20",
          "surface-container": "#211f26",
          "surface-container-high": "#2b2930",
          "surface-container-highest": "#36343b",
          primary: "#a8c7fa",
          "on-primary": "#062e6f",
          "primary-container": "#0842a0",
          "on-primary-container": "#d3e3fd",
          secondary: "#c4c6d0",
          "on-secondary": "#2e3038",
          "secondary-container": "#44474f",
          "on-secondary-container": "#e2e2e9",
          tertiary: "#d0bcff",
          "on-tertiary": "#381e72",
          "tertiary-container": "#4f378b",
          "on-tertiary-container": "#eaddff",
          outline: "#8e919a",
          "outline-variant": "#44474f",
          "on-surface": "#e6e1e5",
          "on-surface-variant": "#cac4d0",
          "inverse-surface": "#e6e1e5",
          "inverse-on-surface": "#313033",
          success: "#6dd58c",
          "success-container": "#0d3b1a",
          "on-success": "#003913",
          "on-success-container": "#a8ebb5",
          warning: "#ffba38",
          "warning-container": "#453100",
          "on-warning": "#412d00",
          "on-warning-container": "#ffde9c",
          error: "#f2b8b5",
          "error-container": "#601410",
          "on-error": "#601410",
          "on-error-container": "#f9dedc",
        },
      },
      borderRadius: {
        "m3-xs": "4px",
        "m3-sm": "8px",
        "m3-md": "12px",
        "m3-lg": "16px",
        "m3-xl": "28px",
      },
      fontSize: {
        "m3-title-lg": ["22px", { lineHeight: "28px", letterSpacing: "0px" }],
        "m3-title-md": ["16px", { lineHeight: "24px", letterSpacing: "0.15px" }],
        "m3-title-sm": ["14px", { lineHeight: "20px", letterSpacing: "0.1px" }],
        "m3-body-lg": ["16px", { lineHeight: "24px", letterSpacing: "0.5px" }],
        "m3-body-md": ["13.5px", { lineHeight: "20px", letterSpacing: "0.25px" }],
        "m3-body-sm": ["12px", { lineHeight: "16px", letterSpacing: "0.4px" }],
        "m3-label-lg": ["13.5px", { lineHeight: "20px", letterSpacing: "0.1px" }],
        "m3-label-md": ["12px", { lineHeight: "16px", letterSpacing: "0.5px" }],
        "m3-label-sm": ["11px", { lineHeight: "16px", letterSpacing: "0.5px" }],
      },
      boxShadow: {
        "m3-elevation-1": "0px 1px 3px 1px rgba(0, 0, 0, 0.15), 0px 1px 2px 0px rgba(0, 0, 0, 0.3)",
        "m3-elevation-2": "0px 2px 6px 2px rgba(0, 0, 0, 0.15), 0px 1px 2px 0px rgba(0, 0, 0, 0.3)",
        "m3-elevation-3": "0px 4px 8px 3px rgba(0, 0, 0, 0.15), 0px 1px 3px 0px rgba(0, 0, 0, 0.3)",
      },
      fontFamily: {
        sans: ["var(--font-roboto)", "Roboto", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["var(--font-roboto-mono)", "Roboto Mono", "monospace"],
      },
      transitionTimingFunction: {
        "m3-standard": "cubic-bezier(0.2, 0.0, 0, 1.0)",
        "m3-decelerate": "cubic-bezier(0.0, 0.0, 0.2, 1.0)",
        "m3-accelerate": "cubic-bezier(0.4, 0.0, 1, 1.0)",
      },
      animation: {
        "m3-fade": "m3Fade 0.2s cubic-bezier(0.0, 0.0, 0.2, 1.0) forwards",
      },
      keyframes: {
        m3Fade: {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },

  plugins: [],
};

export default config;
