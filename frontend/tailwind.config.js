/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Standard, clean font
      },
      colors: {
        gmail: {
          bg: '#f6f8fc', // Standard Gmail background
          sidebar: '#f6f8fc',
          hover: '#eaebef',
          active: '#d3e3fd', // Light blue active item background
          activeText: '#041e49',
          border: '#e1e3e1', // Standard subtle border
          accent: '#c2e7ff', // Gmail compose button color
          accentHover: '#b3d4ec',
          red: '#d93025',
          text: '#202124', // Standard text
          textMuted: '#5f6368', // Secondary text
        }
      }
    },
  },
  plugins: [],
}
