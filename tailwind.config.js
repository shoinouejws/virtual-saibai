/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        soil: {
          empty: '#A0926B',
          tilled: '#8B6914',
        },
        farm: {
          bg: '#F5F0E8',
          green: '#4CAF50',
          'green-dark': '#2E7D32',
          orange: '#FF9800',
          text: '#333333',
          gold: '#FFD700',
        },
      },
      keyframes: {
        'bounce-grow': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.25)' },
        },
        'harvest-pop': {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.5)', opacity: '0.8' },
          '100%': { transform: 'scale(0)', opacity: '0' },
        },
        'fade-in-down': {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'sparkle': {
          '0%, 100%': { boxShadow: '0 0 4px 2px rgba(255, 215, 0, 0.3)' },
          '50%': { boxShadow: '0 0 12px 4px rgba(255, 215, 0, 0.6)' },
        },
      },
      animation: {
        'bounce-grow': 'bounce-grow 0.5s ease-in-out',
        'harvest-pop': 'harvest-pop 0.5s ease-in-out forwards',
        'fade-in-down': 'fade-in-down 0.3s ease-out',
        'sparkle': 'sparkle 1.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
