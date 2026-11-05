/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          900: '#0F172A',
          800: '#1E293B',
          700: '#334155',
        },
        sky: {
          400: '#38BDF8',
        },
        emerald: {
          400: '#34D399',
          500: '#10B981',
        },
        amber: {
          400: '#F59E0B',
        },
        rose: {
          500: '#F43F5E',
        }
      }
    },
  },
  plugins: [],
}
