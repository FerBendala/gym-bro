/**
 * Sistema de espaciado del tema
 * Espaciado, márgenes y padding centralizados
 */

// Espaciado consistente basado en múltiplos de 4px
export const SPACING = {
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
  32: '128px'
} as const;

// Alias para compatibilidad con ui.constants.ts
export const UI_SPACING = SPACING;

// Sistema de spacing genérico para componentes
export const COMPONENT_SPACING = {
  padding: {
    none: 'p-0',
    sm: 'px-4 py-2',
    md: 'px-6 py-4',
    lg: 'px-8 py-6'
  },
  margin: {
    sm: 'mx-2 my-1',
    md: 'mx-4 my-2',
    lg: 'mx-6 my-3'
  }
} as const;

// Spacing responsive
export const RESPONSIVE_SPACING = {
  section: {
    mobile: '',
    tablet: '',
    desktop: 'lg:py-16'
  },
  component: {
    mobile: 'p-4',
    tablet: 'md:p-6',
    desktop: 'lg:p-8'
  },
  gap: {
    mobile: 'gap-4',
    tablet: 'md:gap-6',
    desktop: 'lg:gap-8'
  },
  margin: {
    mobile: 'mb-4',
    tablet: 'md:mb-6',
    desktop: 'lg:mb-8'
  }
} as const;

// Tamaños de componentes
export const COMPONENT_SIZES = {
  none: 'p-0',
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base'
} as const;

// Tamaños de componentes (alias para compatibilidad)
export const UI_SIZES = {
  xs: 'xs',
  sm: 'sm',
  md: 'md',
  lg: 'lg',
  xl: 'xl'
} as const;

// Tipos TypeScript
export type Spacing = keyof typeof SPACING;
export type ComponentSize = keyof typeof COMPONENT_SIZES;
export type PaddingSize = keyof typeof COMPONENT_SPACING.padding;
export type MarginSize = keyof typeof COMPONENT_SPACING.margin;

// Alias para compatibilidad con ui.constants.ts
export type UISpacing = Spacing;
export type UISize = keyof typeof UI_SIZES;

// Constantes legacy para compatibilidad
export const THEME_SPACING = COMPONENT_SPACING; 