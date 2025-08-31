/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'brand-tan': '#e6dbc6',
        'brand-green': '#3a5a40',
        'brand-white': '#ffffff',
        'brand-brown': '#5b2e00',
        'brand-darkgreen': '#194d12',
        'brand-beige': '#fefaf5',
      },
      fontFamily: {
        'heading': ['var(--font-garamond)', 'serif'],
        'body': ['var(--font-inter)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}