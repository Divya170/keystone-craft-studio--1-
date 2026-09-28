import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    screens: {
      // The comp's JS width checks as real breakpoints:
      // < 700 → 2-col product grid + sticky "Ask" bar; >= 900 → desktop nav,
      // shop sidebar, 2-col product page; >= 1100 → overlapping workshop panel.
      sm: '700px',
      lg: '900px',
      xl: '1100px',
      '2xl': '1320px',
    },
    extend: {
      colors: {
        paper: '#F3ECE1',
        ink: '#2B211B',
        clay: { DEFAULT: '#A64A28', hover: '#8C3C1F' },
        cream: '#FBF7F0',
        field: '#FFFDF9',
        sand: '#E8DCCB',
        linen: '#E6DACA',
        rule: '#D6C6B1',
        edge: '#CDBDA8',
        body: '#4A3D34',
        muted: '#5A4A3F',
        note: '#6B5848',
        moss: '#3E4A36',
        sage: '#7C8B6A',
        peach: '#E3A27F',
        gold: '#E3C795',
        oat: '#D8CCBB',
        mist: '#E4DCCD',
        err: { DEFAULT: '#8E2B14', edge: '#9E2F1B', bg: '#F6E1D8', text: '#7A2A14' },
      },
      fontFamily: {
        display: ['var(--font-young-serif)', 'Georgia', 'serif'],
        sans: ['var(--font-hanken)', 'system-ui', 'sans-serif'],
        hand: ['var(--font-caveat)', 'cursive'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      maxWidth: { content: '1320px', wide: '1400px' },
      keyframes: {
        rise: { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'none' } },
      },
      animation: {
        rise: 'rise .4s ease-out both',
      },
    },
  },
  plugins: [],
};

export default config;
