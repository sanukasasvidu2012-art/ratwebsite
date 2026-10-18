/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0b1220',
        panel: '#111b2b',
        elevated: '#172437',
        teal: { 300: '#67e8d1', 400: '#35d4ba', 500: '#16b89f' },
      },
      boxShadow: { glow: '0 0 0 1px rgba(53,212,186,.12), 0 16px 50px rgba(0,0,0,.22)' },
    },
  },
  plugins: [],
}
