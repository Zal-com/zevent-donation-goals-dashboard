/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class', // Enable dark mode via class
  theme: {
    extend: {
      fontFamily: {
        sans: ['Switzer', 'sans-serif'], // Add Switzer as the default font
      },
      colors: {
        darkBg: '#121212',  // Dark background color
        darkText: '#e0e0e0',  // Light text color for dark mode
        darkCard: '#1e1e1e',  // Background for card-like elements in dark mode
      },
    },
  },
  plugins: [],
}

