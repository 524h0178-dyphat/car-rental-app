/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#fff4ee',
          100: '#ffe5d0',
          200: '#ffc8a0',
          300: '#ffa06e',
          400: '#ff7a40',
          500: '#FF6B2C',  // primary
          600: '#e85215',
          700: '#c03c0e',
          800: '#9a2e0c',
          900: '#7c260d',
        },
        surface: {
          50:  '#f8f9fc',
          100: '#f0f2f8',
          200: '#e2e6f0',
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
        'card':      '0 2px 16px 0 rgba(0,0,0,.08)',
        'card-hover':'0 8px 32px 0 rgba(0,0,0,.16)',
        'orange':    '0 8px 24px 0 rgba(255,107,44,.35)',
      },
    },
  },
  plugins: [],
};
