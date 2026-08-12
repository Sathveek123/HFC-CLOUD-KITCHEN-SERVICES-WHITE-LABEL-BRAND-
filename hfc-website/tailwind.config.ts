import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.tsx',
    './components/**/*.tsx',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#CC0000',
          redHover: '#A30000',
          redLight: 'rgba(204,0,0,0.06)',
          black: '#1A1A1A',
          body: '#4A4A4A',
          muted: '#6A6A6A',
          border: '#F0F0F0',
          surface: '#FAFAFA',
          gold: '#C9973A',
          white: '#FFFFFF',
          green: '#2E7D32',
          whatsapp: '#25D366',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        brand: ['var(--font-brand)', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
        tagline: ['var(--font-tagline)', 'Georgia', 'serif'],
      },
      borderRadius: {
        card: '12px',
        pill: '20px',
        btn: '6px',
      },
      boxShadow: {
        card: '0 2px 16px rgba(0,0,0,0.08)',
        cardHover: '0 8px 32px rgba(0,0,0,0.12)',
        drawer: '-4px 0 40px rgba(0,0,0,0.12)',
        float: '0 4px 20px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
}

export default config
