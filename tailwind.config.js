/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: '#FAF8F5',
          card: '#FFFFFF',
          subtle: '#F4EFEA',
          border: '#E8E2D8'
        },
        ink: {
          DEFAULT: '#18181B',
          muted: '#71717A',
          subtle: '#A1A1AA'
        },
        sunny: {
          DEFAULT: '#FFD15C',
          hover: '#F5C240',
          light: '#FFF9E5'
        },
        mint: {
          DEFAULT: '#22C55E',
          hover: '#16A34A',
          light: '#EDFDF2'
        },
        coral: {
          DEFAULT: '#FF6B6B',
          hover: '#EF4444',
          light: '#FEECEC'
        },
        sky: {
          DEFAULT: '#38BDF8',
          hover: '#0EA5E9',
          light: '#F0F9FF'
        },
        lavender: {
          DEFAULT: '#A78BFA',
          light: '#F5F3FF'
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace']
      },
      boxShadow: {
        'cartoon-sm': '2px 2px 0px #18181B',
        'cartoon': '3px 3px 0px #18181B',
        'cartoon-md': '4px 4px 0px #18181B',
        'cartoon-lg': '6px 6px 0px #18181B',
        'cartoon-active': '1px 1px 0px #18181B'
      }
    },
  },
  plugins: [],
}
