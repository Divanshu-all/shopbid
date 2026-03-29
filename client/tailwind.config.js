/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          blue:    '#2563EB',
          light:   '#EFF6FF',
          dark:    '#1E3A8A',
          teal:    '#0EA5E9',
          orange:  '#F97316',
          green:   '#22C55E',
          red:     '#EF4444',
          purple:  '#8B5CF6',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'blue-sm':  '0 2px 8px rgba(37,99,235,0.15)',
        'blue-md':  '0 4px 20px rgba(37,99,235,0.2)',
        'blue-lg':  '0 8px 40px rgba(37,99,235,0.25)',
        'card':     '0 2px 16px rgba(0,0,0,0.06)',
      },
      // Added animation and keyframes for the floating background blobs
      animation: {
        blob: "blob 7s infinite",
      },
      keyframes: {
        blob: {
          "0%": {
            transform: "translate(0px, 0px) scale(1)",
          },
          "33%": {
            transform: "translate(30px, -50px) scale(1.1)",
          },
          "66%": {
            transform: "translate(-20px, 20px) scale(0.9)",
          },
          "100%": {
            transform: "translate(0px, 0px) scale(1)",
          },
        },
      },
    },
  },
  plugins: [],
};