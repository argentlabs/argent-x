/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{svelte,ts}"],
  darkMode: "class",
  theme: {
    extend: {
      boxShadow: {
        "list-item": "0px 2px 12px rgba(0, 0, 0, 0.12)",
        "modal": "0px 4px 20px rgba(0, 0, 0, 0.5)"
      }
    },
  },
  plugins: [],
}
