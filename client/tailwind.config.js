/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#ea580c',
          dark: '#c2410c',
          light: '#feb672',
          hover: '#f97316',
        },
      },
    },
  },
  plugins: [],
}

