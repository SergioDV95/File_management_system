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
      boxShadow: {
        'button': '0 4px 4px 0 #00000040'
      }
    },
  },
  plugins: [],
}

