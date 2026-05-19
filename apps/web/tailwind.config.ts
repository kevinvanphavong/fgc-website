import type { Config } from 'tailwindcss';

/**
 * Tokens FGC — extraits 1:1 de la maquette Claude Design.
 * Source de vérité : DESIGN_SYSTEM.md (sections 1-3).
 * Ne JAMAIS hard-coder une valeur dans le JSX : étendre cette config si un token manque.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    screens: {
      sm: '480px',
      md: '720px',
      lg: '980px',
      xl: '1280px',
    },
    extend: {
      colors: {
        fgc: {
          bg: '#160a3a',
          'bg-deeper': '#0a0420',
          purple: '#3d1b6b',
          'purple-deep': '#2a1458',
          'purple-bright': '#5e2db8',
          yellow: '#ffd93d',
          'yellow-dark': '#e8a92c',
          'yellow-deep': '#f5c518',
          'yellow-shadow': '#b88200',
          'yellow-shadow-deep': '#6f3d00',
          pink: '#e91e63',
          'pink-hot': '#ff2d87',
          'pink-shadow': '#8e0d3d',
          cream: '#fff4e0',
          'cream-warm': '#f8edd8',
          cyan: '#00e5ff',
          magenta: '#ff00c8',
          // Formules anniv (cf. maquette reservation/data.jsx FORMULES.color)
          // — newbowler "silver" pour la formule découverte. Super/Pro
          // réutilisent yellow / pink-hot ci-dessus.
          'silver-formule': '#c9d1d9',
          'silver-formule-dark': '#7a8493',
        },
        admin: {
          brand: '#5E2DB8',
          'brand-deep': '#3D1B6B',
          'brand-soft': '#EFE8FB',
          'brand-ring': 'rgba(94, 45, 184, 0.28)',
          bg: '#F5F6FA',
          'bg-elev': '#FFFFFF',
          'bg-sunken': '#EEEFF4',
          border: '#E2E5EE',
          'border-soft': '#EEF0F5',
          text: '#0F1226',
          'text-muted': '#6B7088',
          green: '#16A34A',
          'green-soft': '#DCFCE7',
          amber: '#D97706',
          'amber-soft': '#FEF3C7',
          red: '#DC2626',
          'red-soft': '#FEE2E2',
          blue: '#0E7490',
          'blue-soft': '#CFFAFE',
          pink: '#DB2777',
          'pink-soft': '#FCE7F3',
          gold: '#B45309',
          slate: '#475569',
        },
      },
      fontFamily: {
        // Importés via next/font dans app/layout.tsx puis exposés en CSS variables
        display: ['var(--font-display)', 'Bowlby One', 'sans-serif'],
        sans: ['var(--font-body)', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        // DS § 3.1 — tokens officiels
        'fgc-sm': '12px',
        'fgc-md': '22px',
        'fgc-lg': '36px',
        // Exceptions documentées dans le DS
        'fgc-field': '14px',
        'fgc-card-soft': '18px',
        'fgc-offer': '24px',
        'fgc-rsv': '28px',
        'fgc-hero': '32px',
        'fgc-title-badge': '40px',
      },
      boxShadow: {
        // DS § 3.2
        'fgc-soft': '0 18px 50px -18px rgba(0, 0, 0, 0.6)',
        'fgc-glow': '0 0 60px rgba(255, 0, 200, 0.25)',
        'fgc-yellow': '0 8px 0 #b88200, 0 22px 40px -10px rgba(0, 0, 0, 0.55)',
        // Boutons 3D
        'fgc-btn-yellow':
          '0 6px 0 #b88200, 0 14px 30px -8px rgba(255, 217, 61, 0.4)',
        'fgc-btn-yellow-hover':
          '0 8px 0 #b88200, 0 20px 40px -8px rgba(255, 217, 61, 0.5)',
        'fgc-btn-pink':
          '0 6px 0 #8e0d3d, 0 14px 30px -8px rgba(255, 45, 135, 0.4)',
        // Title badge "affiche" — la signature
        'fgc-title-badge':
          '0 10px 0 #6f3d00, 0 30px 60px -20px rgba(0, 0, 0, 0.6)',
        // Logo / icones 3D
        'fgc-3d-yellow-sm': '0 4px 0 #b88200',
        'fgc-3d-yellow-md': '0 6px 0 #b88200',
        // Hover card
        'fgc-card-hover': '0 24px 50px -20px rgba(255, 0, 200, 0.3)',
        // Featured price card
        'fgc-featured':
          '0 0 0 1px #e8a92c, 0 30px 60px -20px rgba(255, 217, 61, 0.3)',
      },
      maxWidth: {
        'fgc-wrap': '1240px',
        'fgc-lead': '640px',
        'fgc-sub': '540px',
      },
      backgroundImage: {
        // Gradients réutilisables (DS § 5, 6)
        'fgc-yellow':
          'linear-gradient(180deg, #ffd93d 0%, #e8a92c 100%)',
        'fgc-pink':
          'linear-gradient(180deg, #ff2d87 0%, #e91e63 100%)',
        'fgc-purple-cta':
          'linear-gradient(180deg, #5e2db8 0%, #3d1b6b 100%)',
        'fgc-card':
          'linear-gradient(180deg, rgba(61, 27, 107, 0.85) 0%, rgba(22, 10, 58, 0.95) 100%)',
        'fgc-card-rsv':
          'linear-gradient(180deg, rgba(61, 27, 107, 0.7) 0%, rgba(22, 10, 58, 0.92) 100%)',
        'fgc-strip':
          'linear-gradient(90deg, #1a0f3d 0%, #2a1458 100%)',
        'fgc-icon':
          'linear-gradient(135deg, #ffd93d 0%, #e8a92c 100%)',
      },
      keyframes: {
        pulse: {
          '0%': { boxShadow: '0 0 0 0 rgba(255, 45, 135, 0.6)' },
          '70%': { boxShadow: '0 0 0 12px rgba(255, 45, 135, 0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(255, 45, 135, 0)' },
        },
        'rsv-fwd': {
          from: { opacity: '0', transform: 'translateX(28px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'rsv-back': {
          from: { opacity: '0', transform: 'translateX(-28px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
      },
      animation: {
        'fgc-pulse': 'pulse 1.6s infinite',
        'fgc-rsv-fwd': 'rsv-fwd 0.34s cubic-bezier(.2,.7,.2,1.2)',
        'fgc-rsv-back': 'rsv-back 0.34s cubic-bezier(.2,.7,.2,1.2)',
      },
      letterSpacing: {
        'fgc-display': '0.5px',
        'fgc-eyebrow': '3px',
        'fgc-cap': '1px',
        'fgc-bot': '2px',
      },
    },
  },
  plugins: [],
};

export default config;
