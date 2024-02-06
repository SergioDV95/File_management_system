/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "blue_bg": "url('./src/images/blue_bg.png')",
      },
      fontFamily: {
        'krona': ['Krona One', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

