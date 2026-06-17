import type { Config } from "tailwindcss";

/**
 * "The Capture Deck" — instrument-grade tokens.
 * Dark command-deck chrome for working surfaces; warm paper for the dossier.
 */
const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0E1512", // base command-deck
        panel: "#141D19", // raised surface
        "panel-2": "#1A2520", // cards / inputs
        line: "#2A3A33", // hairline borders
        "line-bright": "#3A4F46",
        mist: "#D8E0D9", // primary text on ink
        muted: "#808F86", // secondary text
        faint: "#5F6E66", // tertiary / captions
        brass: "#C79A4B", // primary signal / seal
        "brass-bright": "#E0B968",
        "brass-dim": "#7C6231",
        teal: "#4FB39A", // interactive accent
        "teal-dim": "#2E6A5C",
        // Fit ramp — desaturated, document-like
        "fit-low": "#C2603F",
        "fit-mod": "#CDA53C",
        "fit-high": "#5CA372",
        "fit-vhigh": "#3F8F6E",
        // Paper dossier
        paper: "#ECE4D2",
        "paper-2": "#E2D8C2",
        "paper-line": "#C9BC9C",
        "paper-ink": "#23271F",
        "paper-muted": "#5E5A48",
      },
      fontFamily: {
        display: ["Archivo", "system-ui", "sans-serif"],
        sans: ['"IBM Plex Sans"', "system-ui", "sans-serif"],
        mono: ['"IBM Plex Mono"', "ui-monospace", "monospace"],
      },
      letterSpacing: {
        eyebrow: "0.22em",
      },
      maxWidth: {
        deck: "1320px",
        dossier: "920px",
      },
      boxShadow: {
        panel:
          "0 1px 0 0 rgba(255,255,255,0.03) inset, 0 18px 40px -24px rgba(0,0,0,0.8)",
        drawer: "-24px 0 60px -30px rgba(0,0,0,0.85)",
        seal:
          "0 0 0 1px rgba(199,154,75,0.35), 0 10px 30px -12px rgba(199,154,75,0.25)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "drawer-in": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        sweep: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(220%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s cubic-bezier(0.2,0.7,0.2,1) both",
        "drawer-in": "drawer-in 0.32s cubic-bezier(0.2,0.7,0.2,1) both",
        sweep: "sweep 1.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
