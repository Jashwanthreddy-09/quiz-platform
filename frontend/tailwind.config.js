/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#6366f1", // Indigo
        secondary: "#8b5cf6",
        accent: "#22c55e",
        dark: {
          DEFAULT: "#030712",
          surface: "#0f172a",
          card: "#1e293b"
        },
        premium: {
          indigo: "#6366f1",
          purple: "#8b5cf6",
          pink: "#d946ef",
          cyan: "#06b6d4"
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
