/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        almarai: ['Almarai', 'sans-serif'],
      },
      colors: {
        navy: '#1C2D4F',
        gold: '#C9A870',
        sand: '#D9D4CB',
        offwhite: '#F6F4F0',
      },
    },
  },
  plugins: [],
}
