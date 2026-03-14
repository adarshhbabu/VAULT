import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Shadcn compat (hex so it doesn't need hsl() wrapper)
        background: "#080b12",
        foreground: "#e8edf5",
        border: "rgba(255,255,255,0.07)",
        input: "#0d1220",
        ring: "#c9a84c",
        primary: {
          DEFAULT: "#c9a84c",
          foreground: "#0a0b08",
        },
        secondary: {
          DEFAULT: "#1a2436",
          foreground: "#e8edf5",
        },
        destructive: {
          DEFAULT: "#e05a5a",
          foreground: "#e8edf5",
        },
        muted: {
          DEFAULT: "#111827",
          foreground: "#94a3b8",
        },
        accent: {
          DEFAULT: "#2dd4bf",
          foreground: "#0a0b08",
        },
        popover: {
          DEFAULT: "#0d1220",
          foreground: "#e8edf5",
        },
        card: {
          DEFAULT: "#111827",
          foreground: "#e8edf5",
        },
        // Vault design tokens
        vault: {
          obsidian: '#080b12',
          deep:     '#0d1220',
          surface:  '#111827',
          surface2: '#1a2436',
          surface3: '#212f45',
          gold:     '#c9a84c',
          goldLight:'#e8c97a',
          teal:     '#2dd4bf',
          red:      '#e05a5a',
          purple:   '#7c6eff',
        }
      },
      borderRadius: {
        DEFAULT: "0.75rem",
        lg: "1rem",
        xl: "1.25rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans:  ['Outfit', 'system-ui', 'sans-serif'],
        mono:  ['DM Mono', 'Courier New', 'monospace'],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      boxShadow: {
        gold: "0 4px 32px rgba(201,168,76,0.18)",
        "gold-lg": "0 8px 48px rgba(201,168,76,0.28)",
        teal: "0 4px 32px rgba(45,212,191,0.18)",
        surface: "0 24px 64px rgba(0,0,0,0.5)",
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
