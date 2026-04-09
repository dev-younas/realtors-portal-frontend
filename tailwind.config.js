/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        luxury: "#0f0f14",
        purpleAccent: "#7c3aed",
        greenAccent: "#10b981"
      }
    },
  },
  plugins: [],
}