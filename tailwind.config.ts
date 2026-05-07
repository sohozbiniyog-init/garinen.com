import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#7C61D4',
        'primary-hover': '#674BC4',
        'primary-soft': '#E7E0FB',
        secondary: '#6DA8D5',
        'secondary-hover': '#4F93C7',
        'secondary-soft': '#E7F3FB',
        success: '#16A34A',
        'success-hover': '#15803D',
        warning: '#D97706',
        'warning-hover': '#B45309',
        danger: '#DC2626',
        'danger-hover': '#B91C1C',
        surface: '#FFFFFF',
        'surface-muted': '#F8FAFC',
        'surface-elevated': '#FFFFFF',
        'text-primary': '#111827',
        'text-secondary': '#6B7280',
        'text-muted': '#9CA3AF',
        'text-inverse': '#FFFFFF',
        border: '#E5E7EB',
        'border-strong': '#D1D5DB',
        ink: '#101114',
        sand: '#f4efe7',
        clay: '#d67b4f',
        moss: '#395144',
        smoke: '#6b7280'
      },
      fontFamily: {
        sans: ['var(--font-noto-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['var(--font-fascinate)', 'cursive'],
        mono: ['var(--font-fira-code)', 'ui-monospace', 'SFMono-Regular', 'monospace']
      },
      boxShadow: {
        soft: '0 18px 50px rgba(16, 17, 20, 0.12)',
        medium: '0 16px 40px rgba(16, 17, 20, 0.16)',
        strong: '0 24px 60px rgba(16, 17, 20, 0.20)'
      },
      borderRadius: {
        xl: '1.5rem',
        '2xl': '2rem',
        '3xl': '2.5rem'
      },
      backgroundImage: {
        // lighter overlay so background carousel remains visible through hero
        'hero-overlay': 'linear-gradient(90deg, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0.12) 48%, rgba(0,0,0,0) 100%)',
        'primary-wash': 'linear-gradient(135deg, #7C61D4 0%, #6DA8D5 100%)',
        'warm-accent': 'linear-gradient(135deg, #7C61D4 0%, #D97706 100%)',
        'surface-glow': 'linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(248,250,252,0.98) 100%)',
        'card-tint': 'linear-gradient(180deg, rgba(124,97,212,0.08) 0%, rgba(109,168,213,0.04) 100%)'
      }
    }
  },
  plugins: []
};

export default config;