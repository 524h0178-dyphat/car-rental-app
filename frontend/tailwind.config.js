/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',  // primary
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        },
        surface: {
          50:  '#f7fbfc',
          100: '#eef8fa',
          200: '#d8edf2',
          800: '#1a1d2e',
          900: '#12141f',
          950: '#0b0d17',
        },
      },
      fontFamily: {
        sans: ['Sora', 'sans-serif'],
        display: ['Clash Display', 'Sora', 'sans-serif'],
      },
      animation: {
        'fade-up':   'fadeUp 0.5s ease forwards',
        'fade-in':   'fadeIn 0.3s ease forwards',
        'shimmer':   'shimmer 1.5s infinite',
        'float':     'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
      },
      boxShadow: {
        'card':      '0 2px 14px 0 rgba(15, 118, 110, .06)',
        'card-hover':'0 8px 26px 0 rgba(15, 118, 110, .12)',
        'orange':    '0 8px 22px 0 rgba(6, 182, 212, .22)',
      },
    },
  },
  plugins: [],
};
