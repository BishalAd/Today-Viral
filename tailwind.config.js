/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF0050',
        secondary: '#00F2EA',
        dark: '#121212',
        card: '#1E1E1E',
      },
      animation: {
        'pulse-slow': 'pulse 3s linear infinite',
      }
    },
  },
  plugins: [],
}