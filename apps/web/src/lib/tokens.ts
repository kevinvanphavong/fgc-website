/**
 * Tokens FGC en TypeScript — utiles côté code (calculs, animations Framer Motion,
 * couleur dynamique sur canvas, etc.).
 *
 * Cette source DOIT rester synchronisée avec :
 *   - src/styles/tokens.css
 *   - tailwind.config.ts
 *   - DESIGN_SYSTEM.md
 */

export const colors = {
  bg: '#160a3a',
  bgDeeper: '#0a0420',
  purple: '#3d1b6b',
  purpleDeep: '#2a1458',
  purpleBright: '#5e2db8',
  yellow: '#ffd93d',
  yellowDark: '#e8a92c',
  yellowDeep: '#f5c518',
  yellowShadow: '#b88200',
  yellowShadowDeep: '#6f3d00',
  pink: '#e91e63',
  pinkHot: '#ff2d87',
  pinkShadow: '#8e0d3d',
  cream: '#fff4e0',
  creamWarm: '#f8edd8',
  cyan: '#00e5ff',
  magenta: '#ff00c8',
} as const;

export const radius = {
  sm: '12px',
  md: '22px',
  lg: '36px',
  pill: '999px',
  // Exceptions documentées
  field: '14px',
  cardSoft: '18px',
  offer: '24px',
  rsv: '28px',
  hero: '32px',
  titleBadge: '40px',
} as const;

export const shadows = {
  soft: '0 18px 50px -18px rgba(0, 0, 0, 0.6)',
  glow: '0 0 60px rgba(255, 0, 200, 0.25)',
  yellow:
    '0 8px 0 #b88200, 0 22px 40px -10px rgba(0, 0, 0, 0.55)',
  btnYellow:
    '0 6px 0 #b88200, 0 14px 30px -8px rgba(255, 217, 61, 0.4)',
  btnPink:
    '0 6px 0 #8e0d3d, 0 14px 30px -8px rgba(255, 45, 135, 0.4)',
  titleBadge:
    '0 10px 0 #6f3d00, 0 30px 60px -20px rgba(0, 0, 0, 0.6)',
  cardHover: '0 24px 50px -20px rgba(255, 0, 200, 0.3)',
} as const;

export const breakpoints = {
  /** Bascule grids 3-col → 2-col, hero passe en 1 col */
  tablet: 980,
  /** Bascule en mobile complet (burger, 1-col partout) */
  mobile: 720,
} as const;

export const containerMaxWidth = 1240;

export type FgcColor = keyof typeof colors;
