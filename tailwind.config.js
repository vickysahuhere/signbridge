/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        retro: {
          bg: '#C0C0C0',
          fg: '#000000',
          muted: '#808080',
          accent: '#0000FF',
          secondary: '#FF0000',
          tertiary: '#FFFF00',
          success: '#00FF00',
          successDark: '#00AA00',
          borderLight: '#FFFFFF',
          borderDark: '#808080',
          titleBar: '#000080',
          titleBarEnd: '#1084D0',
          panelYellow: '#FFFFCC',
          visited: '#800080',
          hover: '#FF0000',
          lightRow: '#FFFFFF',
          darkRow: '#E8E8E8',
        }
      },
      fontFamily: {
        sans: ['"MS Sans Serif"', '"Segoe UI"', 'Tahoma', 'Geneva', 'Verdana', 'sans-serif'],
        heading: ['"Arial Black"', 'Impact', 'Haettenschweiler', 'sans-serif'],
        mono: ['"Courier New"', 'Courier', 'monospace'],
        comic: ['"Comic Sans MS"', 'cursive']
      }
    },
  },
  plugins: [],
}
