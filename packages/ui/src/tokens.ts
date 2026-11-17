/**
 * OneXDeal v1 Design System Tokens (docs/03-design-system.md).
 * Shared across React Native (`apps/mobile`) and Next.js (`apps/web`).
 */

export const colors = {
  brand: {
    primary: '#155EEF',
    primaryPressed: '#004EEB',
    secondary: '#0E9384',
  },
  text: {
    primary: '#101828',
    secondary: '#475467',
  },
  surface: {
    base: '#F8FAFC',
    card: '#FFFFFF',
  },
  border: {
    default: '#D0D5DD',
  },
  status: {
    success: '#067647',
    warning: '#B54708',
    danger: '#B42318',
  },
} as const;

export const typography = {
  display: { fontSize: 28, lineHeight: 34, fontWeight: '700' },
  heading1: { fontSize: 24, lineHeight: 30, fontWeight: '700' },
  heading2: { fontSize: 20, lineHeight: 26, fontWeight: '600' },
  heading3: { fontSize: 16, lineHeight: 22, fontWeight: '600' },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400' },
  bodySmall: { fontSize: 14, lineHeight: 20, fontWeight: '400' },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '400' },
  button: { fontSize: 15, lineHeight: 20, fontWeight: '600' },
} as const;

export const spacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
} as const;

export const touchTargets = {
  minSizePt: 44,
  controlHeightMd: 46,
} as const;

export const breakpoints = {
  smallMax: 639,
  mediumMin: 640,
  mediumMax: 1023,
  largeMin: 1024,
} as const;
