/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        ink: {
          50: '#f0f0f5',
          100: '#dddde8',
          200: '#b8b8d0',
          300: '#8888a8',
          400: '#555578',
          500: '#2d2d52',
          600: '#1e1e3f',
          700: '#141430',
          800: '#0d0d22',
          900: '#070714',
        },
        volt: {
          400: '#c8ff57',
          500: '#b8f040',
          600: '#9fd426',
        },
        rose: {
          task: '#ff6b8a',
        }
      }
    },
  },
  plugins: [],
}
