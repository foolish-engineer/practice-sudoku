/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        pulseHighlight: {
          '0%': { transform: 'scale(1)', backgroundColor: '#bbdefb', boxShadow: '0 0 0 0 rgba(33, 150, 243, 0.7)' },
          '50%': { transform: 'scale(1.08)', backgroundColor: '#90caf9', boxShadow: '0 0 12px 3px rgba(33, 150, 243, 0.5)', zIndex: '10' },
          '100%': { transform: 'scale(1)', backgroundColor: '#bbdefb', boxShadow: '0 0 0 0 rgba(33, 150, 243, 0)' },
        }
      },
      animation: {
        'pulse-highlight': 'pulseHighlight 0.75s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}

