/**
 * Sistema de tipografía del tema
 * Fuentes, tamaños y pesos centralizados
 */

// Tipografía moderna con mejor legibilidad
export const TYPOGRAPHY = {
  fontFamily: {
    sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
    mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'monospace'],
  },

  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],
    sm: ['0.875rem', { lineHeight: '1.25rem' }],
    base: ['1rem', { lineHeight: '1.5rem' }],
    lg: ['1.125rem', { lineHeight: '1.75rem' }],
    xl: ['1.25rem', { lineHeight: '1.75rem' }],
    '2xl': ['1.5rem', { lineHeight: '2rem' }],
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
    '5xl': ['3rem', { lineHeight: '1' }],
    '6xl': ['3.75rem', { lineHeight: '1' }],
  },

  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
} as const;

// Alias para compatibilidad con ui.constants.ts
export const UI_TYPOGRAPHY = TYPOGRAPHY;

// Tipografía responsive
export const RESPONSIVE_TYPOGRAPHY = {
  h1: {
    mobile: 'text-2xl',
    tablet: 'md:text-3xl',
    desktop: 'lg:text-4xl',
    weight: 'font-bold',
    leading: 'leading-tight',
  },
  h2: {
    mobile: 'text-xl',
    tablet: 'md:text-2xl',
    desktop: 'lg:text-3xl',
    weight: 'font-semibold',
    leading: 'leading-tight',
  },
  h3: {
    mobile: 'text-lg',
    tablet: 'md:text-xl',
    desktop: 'lg:text-2xl',
    weight: 'font-medium',
    leading: 'leading-snug',
  },
  body: {
    mobile: 'text-sm',
    tablet: 'md:text-base',
    weight: 'font-normal',
    leading: 'leading-relaxed',
  },
  small: {
    mobile: 'text-xs',
    tablet: 'md:text-sm',
    weight: 'font-normal',
    leading: 'leading-normal',
  },
} as const;

// Tipos TypeScript
export type FontSize = keyof typeof TYPOGRAPHY.fontSize;
export type FontWeight = keyof typeof TYPOGRAPHY.fontWeight;
export type FontFamily = keyof typeof TYPOGRAPHY.fontFamily;

// Alias para compatibilidad con ui.constants.ts
export type UIFontSize = FontSize;
export type UIFontWeight = FontWeight;
