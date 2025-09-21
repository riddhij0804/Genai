/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  // Add this line to make Tailwind work correctly when deployed under relative paths
  darkMode: 'class', // optional if you use dark mode
}
