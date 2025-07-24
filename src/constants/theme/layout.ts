/**
 * Sistema de layout y responsive del tema
 * Breakpoints, grid, navegación y layout responsive
 */

import { RESPONSIVE_SPACING } from './spacing';
import { RESPONSIVE_TYPOGRAPHY } from './typography';

// Breakpoints estándar mobile-first
export const BREAKPOINTS = {
  sm: '640px',   // Móvil grande / Tablet pequeña
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop pequeño
  xl: '1280px',  // Desktop
  '2xl': '1536px' // Desktop grande
} as const;

// Alias para compatibilidad con ui.constants.ts
export const UI_BREAKPOINTS = BREAKPOINTS;

// Layout moderno con mejor estructura
export const LAYOUT = {
  container: {
    base: 'w-full mx-auto px-4 sm:px-6 lg:px-8',
    maxWidth: {
      sm: 'max-w-screen-sm',
      md: 'max-w-screen-md',
      lg: 'max-w-screen-lg',
      xl: 'max-w-screen-xl',
      '2xl': 'max-w-screen-2xl'
    }
  },

  section: {
    padding: {
      mobile: 'py-8 px-4',
      tablet: 'py-12 px-6',
      desktop: 'py-16 px-8'
    }
  },

  grid: {
    responsive: {
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
      auto: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
    },
    gap: {
      sm: 'gap-3',
      md: 'gap-4',
      lg: 'gap-6',
      xl: 'gap-8'
    }
  }
} as const;

// Navegación moderna
export const NAVIGATION = {
  bottomNav: {
    container: 'sticky bottom-0 bg-gray-900/95 backdrop-blur-md border-t border-gray-700/50 px-4 py-2 safe-bottom z-40',
    grid: 'grid grid-cols-6 gap-1',
    item: 'flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-all duration-200 min-h-[48px]',
    active: 'bg-blue-600/20 text-blue-400',
    inactive: 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/50'
  },

  bottomNavCompact: {
    container: 'sticky bottom-4 mx-6 bg-gray-900/80 backdrop-blur-md border border-gray-700/50 rounded-[2rem] shadow-2xl z-40',
    grid: 'grid grid-cols-4 gap-2 p-4',
    item: 'flex items-center justify-center p-3 rounded-[1.5rem] transition-all duration-200 min-h-[52px] relative',
    active: 'bg-blue-600/20 text-blue-400 shadow-lg',
    inactive: 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/50'
  },

  topNav: {
    container: 'bg-gray-900/95 backdrop-blur-md border-b border-gray-700/50 safe-top',
    content: 'flex items-center justify-between px-4 py-3 min-h-[56px]',
    title: 'text-lg font-semibold text-white',
    actions: 'flex items-center gap-2'
  }
} as const;

// Touch targets optimizados para móvil
export const TOUCH = {
  minTarget: 'min-h-[44px] min-w-[44px]',
  padding: {
    sm: 'p-2',
    md: 'p-3',
    lg: 'p-4'
  },
  tap: 'active:scale-95 transition-transform duration-100'
} as const;

// Utilidades de responsive design
export const RESPONSIVE = {
  visibility: {
    mobile: 'block sm:hidden',
    tablet: 'hidden sm:block lg:hidden',
    desktop: 'hidden lg:block',
    tabletUp: 'hidden sm:block',
    mobileToTablet: 'block lg:hidden'
  },

  spacing: {
    section: 'py-8 sm:py-12 lg:py-16',
    component: 'p-4 sm:p-6 lg:p-8',
    gap: 'gap-4 sm:gap-6 lg:gap-8'
  }
} as const;

// Tipos TypeScript
export type Breakpoint = keyof typeof BREAKPOINTS;
export type GridCols = keyof typeof LAYOUT.grid.responsive;
export type GridGap = keyof typeof LAYOUT.grid.gap;
export type ContainerMaxWidth = keyof typeof LAYOUT.container.maxWidth;

// Alias para compatibilidad con ui.constants.ts
export type UIBreakpoint = Breakpoint;

// Constantes legacy para compatibilidad
export const THEME_RESPONSIVE = {
  breakpoints: BREAKPOINTS,
  container: LAYOUT.container,
  spacing: RESPONSIVE_SPACING,
  typography: RESPONSIVE_TYPOGRAPHY,
  grid: LAYOUT.grid,
  touch: TOUCH,
  navigation: NAVIGATION,
  card: {
    container: 'w-full',
    padding: 'p-4 sm:p-6',
    spacing: 'space-y-4 sm:space-y-6',
    grid: 'grid gap-4 sm:gap-6'
  },
  visibility: RESPONSIVE.visibility
} as const; 