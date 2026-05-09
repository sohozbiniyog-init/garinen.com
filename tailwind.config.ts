import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'brand-red': '#E63946',
        'brand-red-deep': '#C92A39',
        'brand-black': '#0B0B0C',
        'brand-gray': '#7D8B94',
        'brand-surface': '#F7F7F8',
        'brand-surface-elevated': '#FFFFFF',
        primary: '#E63946',
        'primary-hover': '#C92A39',
        'primary-soft': '#FDEBEC',
        secondary: '#7D8B94',
        'secondary-hover': '#67737B',
        'secondary-soft': '#EEF0F2',
        success: '#16A34A',
        'success-hover': '#15803D',
        warning: '#D97706',
        'warning-hover': '#B45309',
        danger: '#DC2626',
        'danger-hover': '#B91C1C',
        surface: '#FFFFFF',
        'surface-muted': '#F7F7F8',
        'surface-elevated': '#FFFFFF',
        'text-primary': '#0B0B0C',
        'text-secondary': '#7D8B94',
        'text-muted': '#A1A7AE',
        'text-inverse': '#FFFFFF',
        border: '#E6E8EB',
        'border-strong': '#CDD3D8',
        ink: '#0B0B0C',
        sand: '#F4EFE7',
        clay: '#E04B55',
        moss: '#E63946',
        smoke: '#7D8B94'
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
        'hero-overlay': 'linear-gradient(90deg, rgba(10,10,12,0.78) 0%, rgba(10,10,12,0.42) 48%, rgba(10,10,12,0.08) 100%)',
        'primary-wash': 'linear-gradient(135deg, #E63946 0%, #B91C1C 100%)',
        'warm-accent': 'linear-gradient(135deg, #E63946 0%, #7D8B94 100%)',
        'surface-glow': 'linear-gradient(180deg, rgba(255,255,255,0.94) 0%, rgba(247,247,248,0.98) 100%)',
        'card-tint': 'linear-gradient(180deg, rgba(230,57,70,0.08) 0%, rgba(125,139,148,0.03) 100%)'
      }
    }
  },
  plugins: []
};

export default config;