/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#FFFBF0',
          100: '#FDF4E0',
          200: '#FAE8BE',
          300: '#F6DC9C',
          400: '#EFC973',
          500: '#E8B64C',
          600: '#D4A043',
          700: '#A37B34',
          800: '#6E5323',
          900: '#3A2C12',
        },
        champagne: {
          50: '#FEFDFB',
          100: '#FDF8EE',
          200: '#F9EFDA',
          300: '#F3E2BE',
          400: '#EBD19E',
          500: '#E3C080',
          600: '#D0A65E',
          700: '#A88048',
          800: '#745932',
          900: '#3C2E19',
        },
        dark: {
          50: '#F5F5F5',
          100: '#E5E5E5',
          200: '#CCCCCC',
          300: '#A3A3A3',
          400: '#666666',
          500: '#333333',
          600: '#262626',
          700: '#1A1A1A',
          800: '#0D0D0D',
          900: '#0A0A0A',
          950: '#050505',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      boxShadow: {
        'gold-glow': '0 0 40px rgba(232, 182, 76, 0.15)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.3)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
