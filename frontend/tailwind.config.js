/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#10264A',
          dark: '#0A1931',
          light: '#1B3B6F',
        },
        royal: {
          DEFAULT: '#2878D4',
          hover: '#1F63B4',
          light: '#E8F2FD',
        },
        sky: {
          DEFAULT: '#69B7FF',
          light: '#BAE0FF',
        },
        lavender: {
          DEFAULT: '#8B7CF6',
          light: '#EDE9FE',
          surface: '#F0EDFF',
        },
        teal: {
          DEFAULT: '#24B8A6',
          light: '#CCFBF1',
          dark: '#0F766E',
        },
        amber: {
          DEFAULT: '#F5A34D',
          light: '#FEF3C7',
          dark: '#B45309',
        },
        pale: {
          bg: '#EAF2FF',
          surface: '#F0EDFF',
          card: '#FFFFFF',
          border: '#D8E5F8',
        },
        content: {
          dark: '#17365D',
          muted: '#5A6E85',
          subtle: '#8898AA',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        'card': '12px',
        'input': '8px',
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(16, 38, 74, 0.05), 0 1px 2px 0 rgba(16, 38, 74, 0.03)',
        'card': '0 4px 6px -1px rgba(16, 38, 74, 0.05), 0 2px 4px -1px rgba(16, 38, 74, 0.03)',
        'glow-royal': '0 0 15px rgba(40, 120, 212, 0.25)',
      }
    },
  },
  plugins: [],
}
