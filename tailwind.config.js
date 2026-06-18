/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        // 主色调：深墨蓝
        ink: {
          50: "#F4F6FA",
          100: "#E8EDF5",
          200: "#C9D4E8",
          300: "#9DB0D1",
          400: "#6B85B0",
          500: "#475F8E",
          600: "#2E4670",
          700: "#1A2B4A",
          800: "#142139",
          900: "#0E1729",
        },
        // 背景色：暖米白
        cream: {
          50: "#FDFBF7",
          100: "#FAF6EE",
          200: "#F3EAD9",
          300: "#E8D9BE",
          400: "#D9C49C",
        },
        // 强调色：琥珀金
        amber: {
          50: "#FDF8EE",
          100: "#FAEFD4",
          200: "#F4DDA8",
          300: "#ECC56E",
          400: "#D4A24C",
          500: "#B88432",
          600: "#946626",
          700: "#714D20",
        },
        // 难度色系
        easy: {
          light: "#A8C9B0",
          DEFAULT: "#6B9E78",
          dark: "#4A7A57",
        },
        medium: {
          light: "#ECC56E",
          DEFAULT: "#D4A24C",
          dark: "#946626",
        },
        hard: {
          light: "#DC8B75",
          DEFAULT: "#C8553D",
          dark: "#9A3D2A",
        },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', '"Fraunces"', "Georgia", "serif"],
        sans: ['"Plus Jakarta Sans"', '"Noto Sans SC"', "system-ui", "sans-serif"],
        display: ['"Fraunces"', '"Noto Serif SC"', "Georgia", "serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "pulse-ring": "pulseRing 1.5s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
        "float": "float 3s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseRing: {
          "0%": { transform: "scale(0.95)", opacity: "0.7" },
          "70%": { transform: "scale(1.3)", opacity: "0" },
          "100%": { transform: "scale(0.95)", opacity: "0" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
    },
  },
  plugins: [],
};
