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
          bg: '#F9F6F1',
          panel: '#F3EFE8',
          green: '#4D8B4D',
          'green-dark': '#326832',
          'green-light': '#E5F0E0',
          brown: '#7A6548',
          'brown-dark': '#5C4A32',
          'brown-light': '#EDE6D8',
          accent: '#C06830',
          'accent-light': '#FFF3EB',
          text: '#2E2A22',
          'text-secondary': '#8A7F72',
          gold: '#C8960C',
          'gold-light': '#FFF8E6',
          border: '#DDD6CA',
        },
      },
      keyframes: {
        'bounce-grow': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.08)' },
        },
        'harvest-pop': {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.2)', opacity: '0.8' },
          '100%': { transform: 'scale(0)', opacity: '0' },
        },
        'fade-in-down': {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'harvest-glow': {
          '0%, 100%': { boxShadow: '0 0 4px 1px rgba(200, 150, 12, 0.2)' },
          '50%': { boxShadow: '0 0 10px 3px rgba(200, 150, 12, 0.4)' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.35', transform: 'scale(1)' },
          '50%': { opacity: '0.6', transform: 'scale(1.08)' },
        },
        'rain-drop': {
          '0%': { transform: 'translateY(0)', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { transform: 'translateY(100vh)', opacity: '0' },
        },
        'bird-fly': {
          '0%': { transform: 'translateX(0) scaleX(-1)', opacity: '0' },
          '10%': { opacity: '1' },
          '50%': { transform: 'translateX(calc(50vw + 30px)) scaleX(-1) translateY(-20px)' },
          '90%': { opacity: '1' },
          '100%': { transform: 'translateX(calc(100vw + 60px)) scaleX(-1) translateY(10px)', opacity: '0' },
        },
        /** セル詳細：波系（回転＋横移動のループ） */
        'crop-wave-standard': {
          '0%, 100%': { transform: 'rotate(-2deg) translateX(-4px)' },
          '25%': { transform: 'rotate(1.2deg) translateX(5px)' },
          '50%': { transform: 'rotate(2.5deg) translateX(2px)' },
          '75%': { transform: 'rotate(-0.8deg) translateX(-5px)' },
        },
        'crop-wave-brisk': {
          '0%, 100%': { transform: 'rotate(-1.5deg) translateX(-2px)' },
          '25%': { transform: 'rotate(1deg) translateX(3px)' },
          '50%': { transform: 'rotate(1.8deg) translateX(1px)' },
          '75%': { transform: 'rotate(-0.6deg) translateX(-3px)' },
        },
        'crop-wave-surge': {
          '0%, 100%': { transform: 'rotate(-2.8deg) translateX(-6px)' },
          '25%': { transform: 'rotate(1.8deg) translateX(7px)' },
          '50%': { transform: 'rotate(3.2deg) translateX(3px)' },
          '75%': { transform: 'rotate(-1.2deg) translateX(-8px)' },
        },
        /** セル詳細：浮き系（縦＋軽回転） */
        'crop-bob-standard': {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-7px) rotate(1.6deg)' },
        },
        'crop-bob-drift': {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-4px) rotate(0.9deg)' },
        },
        'crop-bob-rise': {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-10px) rotate(2.2deg)' },
        },
      },
      animation: {
        'bounce-grow': 'bounce-grow 0.4s ease-in-out',
        'harvest-pop': 'harvest-pop 0.5s ease-in-out forwards',
        'fade-in-down': 'fade-in-down 0.25s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'harvest-glow': 'harvest-glow 2s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 2.5s ease-in-out infinite',
        'rain-drop': 'rain-drop 0.8s linear infinite',
        'bird-fly': 'bird-fly 1.8s ease-in-out forwards',
        'crop-wave-standard': 'crop-wave-standard 5.5s ease-in-out infinite',
        'crop-wave-brisk': 'crop-wave-brisk 3.4s ease-in-out infinite',
        'crop-wave-surge': 'crop-wave-surge 6s ease-in-out infinite',
        'crop-bob-standard': 'crop-bob-standard 3.2s ease-in-out infinite',
        'crop-bob-drift': 'crop-bob-drift 4.2s ease-in-out infinite',
        'crop-bob-rise': 'crop-bob-rise 2.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
