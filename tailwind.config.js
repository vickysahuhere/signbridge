/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        duo: {
          green: {
            DEFAULT: '#58CC02',
            dark: '#46A302',
            hover: '#61E002',
            light: '#D7FFB8',
            subtle: '#EEFDE5'
          },
          blue: {
            DEFAULT: '#1CB0F6',
            dark: '#1899D6',
            hover: '#24BEFF',
            light: '#DDF4FE'
          },
          gold: {
            DEFAULT: '#FFC800',
            dark: '#E5A500',
            hover: '#FFD426',
            light: '#FFF5D1'
          },
          coral: {
            DEFAULT: '#FF4B4B',
            dark: '#EA2B2B',
            hover: '#FF5E5E',
            light: '#FFDFDF'
          },
          purple: {
            DEFAULT: '#CE82FF',
            dark: '#A559D9',
            hover: '#D696FF',
            light: '#F7ECFF'
          },
          gray: {
            50: '#F7F7F7',
            100: '#E5E5E5',
            200: '#CECECE',
            300: '#AFAFAF',
            400: '#777777',
            500: '#4B4B4B',
            600: '#3C3C3C',
            700: '#262626',
            800: '#18181B'
          }
        },
        cream: {
          DEFAULT: '#F7F7F7',
          card: '#FFFFFF',
          subtle: '#F4F5F6',
          border: '#E5E5E5'
        },
        ink: {
          DEFAULT: '#3C3C3C',
          muted: '#777777',
          subtle: '#AFAFAF'
        },
        sunny: {
          DEFAULT: '#FFC800',
          hover: '#E5A500',
          light: '#FFF5D1'
        },
        mint: {
          DEFAULT: '#58CC02',
          hover: '#46A302',
          light: '#EEFDE5'
        },
        coral: {
          DEFAULT: '#FF4B4B',
          hover: '#EA2B2B',
          light: '#FFDFDF'
        },
        sky: {
          DEFAULT: '#1CB0F6',
          hover: '#1899D6',
          light: '#DDF4FE'
        },
        lavender: {
          DEFAULT: '#CE82FF',
          hover: '#A559D9',
          light: '#F7ECFF'
        }
      },
      fontFamily: {
        sans: ['"Nunito"', '"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Nunito"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace']
      },
      boxShadow: {
        'cartoon-sm': '0 2px 0 #E5E5E5',
        'cartoon': '0 3px 0 #E5E5E5',
        'cartoon-md': '0 4px 0 #E5E5E5',
        'cartoon-lg': '0 6px 0 #CECECE',
        'cartoon-active': '0 1px 0 #E5E5E5'
      }
    },
  },
  plugins: [],
}
