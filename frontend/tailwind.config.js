/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f3ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          550: '#6366f1', // custom
          500: '#4f46e5',
          600: '#4338ca',
          700: '#3730a3',
          800: '#1e1b4b',
          900: '#311042',
        },
      },
    },
  },
  plugins: [],
}
