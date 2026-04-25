/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // JunglePet palette — deep jungle dark + LoL hextech gold + arcane purple
        jungle: {
          50: '#eef5f1',
          100: '#d4e6dc',
          200: '#a9cdb8',
          300: '#7eb494',
          400: '#5b8e7d',
          500: '#3e6b5b',
          600: '#2d5044',
          700: '#1f3a32',
          800: '#122421',
          900: '#0a1614',
          950: '#04090a',
        },
        gold: {
          300: '#f5dfa3',
          400: '#f0c465',
          500: '#c89b3c',
          600: '#a17a2a',
          700: '#7a5a1f',
        },
        arcane: {
          300: '#b8a3f0',
          400: '#9d7ce8',
          500: '#7e60b8',
          600: '#5d4690',
        },
        ember: {
          400: '#ff8a5b',
          500: '#e85f3a',
          600: '#c84628',
        },
      },
      fontFamily: {
        display: ['"Cinzel"', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        float: 'float 6s ease-in-out infinite',
        shimmer: 'shimmer 2.5s linear infinite',
        aurora: 'aurora 18s ease infinite',
        glow: 'glow 2.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        slideUp: {
          '0%': { opacity: 0, transform: 'translateY(20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        aurora: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        glow: {
          '0%, 100%': {
            filter: 'drop-shadow(0 0 8px rgba(240, 196, 101, 0.4))',
          },
          '50%': { filter: 'drop-shadow(0 0 24px rgba(240, 196, 101, 0.8))' },
        },
      },
      backgroundImage: {
        'gold-gradient':
          'linear-gradient(135deg, #f0c465 0%, #c89b3c 50%, #7a5a1f 100%)',
        'jungle-gradient':
          'linear-gradient(135deg, #0a1614 0%, #122421 50%, #1f3a32 100%)',
      },
    },
  },
  plugins: [],
};
