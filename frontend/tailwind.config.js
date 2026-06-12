/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-bg': '#1a1a2e',
        'dark-bg-secondary': '#16213e',
        'primary': '#9b59b6',
        'primary-hover': '#8e44ad',
      },
    },
  },
  plugins: [],
}
