/**
 * Sistema de Diseño Moderno - Mobile-First
 * Basado en las mejores prácticas de UX/UI actuales
 * Optimizado para dispositivos móviles con soporte completo para desktop
 */

// Paleta de colores moderna con mejor contraste y accesibilidad
export const MODERN_COLORS = {
  // Grises modernos con mejor contraste
  gray: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0a0a0a'
  },

  // Azul principal más vibrante
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554'
  },

  // Verde para éxito y progreso
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d'
  },

  // Rojo para errores y alertas
  danger: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d'
  },

  // Amarillo para advertencias
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f'
  }
} as const;

// Tipografía moderna con mejor legibilidad
export const MODERN_TYPOGRAPHY = {
  fontFamily: {
    sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
    mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'monospace']
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
    '6xl': ['3.75rem', { lineHeight: '1' }]
  },

  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700'
  }
} as const;

// Espaciado consistente basado en múltiplos de 4px
export const MODERN_SPACING = {
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

// Bordes redondeados modernos
export const MODERN_RADIUS = {
  none: '0px',
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '24px',
  '3xl': '32px',
  full: '9999px'
} as const;

// Sombras modernas con mejor profundidad
export const MODERN_SHADOWS = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)'
} as const;

// Layout moderno con mejor estructura
export const MODERN_LAYOUT = {
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

// Componentes base modernos
export const MODERN_COMPONENTS = {
  button: {
    base: 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed',

    sizes: {
      sm: 'px-3 py-1.5 text-sm min-h-[36px]',
      md: 'px-4 py-2 text-sm min-h-[40px]',
      lg: 'px-6 py-3 text-base min-h-[44px]',
      xl: 'px-8 py-4 text-lg min-h-[48px]'
    },

    variants: {
      primary: `bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl focus:ring-blue-500 active:scale-95`,
      secondary: `bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 hover:border-gray-600 focus:ring-gray-500 active:scale-95`,
      ghost: `hover:bg-gray-800 text-gray-300 hover:text-white focus:ring-gray-500 active:scale-95`,
      danger: `bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl focus:ring-red-500 active:scale-95`,
      success: `bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl focus:ring-green-500 active:scale-95`
    }
  },

  card: {
    base: 'bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200',
    padding: {
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8'
    },
    variants: {
      default: 'hover:border-gray-600/50',
      active: 'border-blue-500/50 bg-blue-900/10',
      success: 'border-green-500/50 bg-green-900/10',
      warning: 'border-yellow-500/50 bg-yellow-900/10',
      danger: 'border-red-500/50 bg-red-900/10'
    }
  },

  input: {
    base: 'block w-full rounded-lg border bg-gray-800/50 backdrop-blur-sm text-white placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900',
    sizes: {
      sm: 'px-3 py-2 text-sm min-h-[36px]',
      md: 'px-4 py-2.5 text-sm min-h-[40px]',
      lg: 'px-4 py-3 text-base min-h-[44px]'
    },
    variants: {
      default: 'border-gray-700/50 focus:border-blue-500 focus:ring-blue-500/20',
      error: 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20',
      success: 'border-green-500/50 focus:border-green-500 focus:ring-green-500/20'
    }
  },

  modal: {
    overlay: 'fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50',
    container: 'bg-gray-900/95 backdrop-blur-md rounded-2xl border border-gray-700/50 shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden',
    header: 'flex items-center justify-between p-6 border-b border-gray-700/50',
    content: 'overflow-y-auto',
    footer: 'flex items-center justify-end gap-3 p-6 border-t border-gray-700/50'
  }
} as const;

// Touch targets optimizados para móvil
export const MODERN_TOUCH = {
  minTarget: 'min-h-[44px] min-w-[44px]',
  padding: {
    sm: 'p-2',
    md: 'p-3',
    lg: 'p-4'
  },
  tap: 'active:scale-95 transition-transform duration-100'
} as const;

// Navegación moderna
export const MODERN_NAVIGATION = {
  bottomNav: {
    container: 'sticky bottom-0 bg-gray-900/95 backdrop-blur-md border-t border-gray-700/50 px-4 py-2 safe-bottom z-40',
    grid: 'grid grid-cols-5 gap-1',
    item: 'flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-all duration-200 min-h-[48px]',
    active: 'bg-blue-600/20 text-blue-400',
    inactive: 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/50'
  },

  topNav: {
    container: 'bg-gray-900/95 backdrop-blur-md border-b border-gray-700/50 safe-top',
    content: 'flex items-center justify-between px-4 py-3 min-h-[56px]',
    title: 'text-lg font-semibold text-white',
    actions: 'flex items-center gap-2'
  },

  tabs: {
    container: 'flex overflow-x-auto scrollbar-hide border-b border-gray-700/50',
    item: 'flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-all duration-200 min-h-[44px]',
    active: 'border-blue-500 text-blue-400 bg-blue-500/10',
    inactive: 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
  }
} as const;

// Animaciones suaves
export const MODERN_ANIMATIONS = {
  transition: {
    fast: 'transition-all duration-150 ease-out',
    normal: 'transition-all duration-200 ease-out',
    slow: 'transition-all duration-300 ease-out'
  },

  scale: {
    tap: 'active:scale-95',
    hover: 'hover:scale-105',
    focus: 'focus:scale-105'
  },

  fade: {
    in: 'animate-in fade-in duration-200',
    out: 'animate-out fade-out duration-150'
  },

  slide: {
    up: 'animate-in slide-in-from-bottom-4 duration-300',
    down: 'animate-in slide-in-from-top-4 duration-300',
    left: 'animate-in slide-in-from-right-4 duration-300',
    right: 'animate-in slide-in-from-left-4 duration-300'
  }
} as const;

// Estados de carga modernos
export const MODERN_LOADING = {
  spinner: {
    base: 'animate-spin rounded-full border-2 border-gray-700',
    sizes: {
      sm: 'h-4 w-4 border-t-gray-400',
      md: 'h-6 w-6 border-t-gray-300',
      lg: 'h-8 w-8 border-t-white',
      xl: 'h-12 w-12 border-t-white'
    }
  },

  skeleton: {
    base: 'animate-pulse bg-gray-800/50 rounded',
    variants: {
      text: 'h-4 w-full',
      title: 'h-6 w-3/4',
      avatar: 'h-10 w-10 rounded-full',
      button: 'h-10 w-24 rounded-lg',
      card: 'h-32 w-full rounded-xl'
    }
  },

  pulse: 'animate-pulse bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-[length:200%_100%] animate-[shimmer_2s_infinite]'
} as const;

// Utilidades de responsive design
export const MODERN_RESPONSIVE = {
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  },

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

// Accesibilidad mejorada
export const MODERN_ACCESSIBILITY = {
  focusRing: 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900',
  screenReader: 'sr-only',
  skipLink: 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-lg z-50',

  contrast: {
    high: 'text-white',
    medium: 'text-gray-200',
    low: 'text-gray-400'
  },

  motion: {
    reduce: 'motion-reduce:transition-none motion-reduce:animate-none'
  }
} as const;

// Exportar todo el sistema
export const MODERN_THEME = {
  colors: MODERN_COLORS,
  typography: MODERN_TYPOGRAPHY,
  spacing: MODERN_SPACING,
  radius: MODERN_RADIUS,
  shadows: MODERN_SHADOWS,
  layout: MODERN_LAYOUT,
  components: MODERN_COMPONENTS,
  touch: MODERN_TOUCH,
  navigation: MODERN_NAVIGATION,
  animations: MODERN_ANIMATIONS,
  loading: MODERN_LOADING,
  responsive: MODERN_RESPONSIVE,
  accessibility: MODERN_ACCESSIBILITY
} as const;

// Tipos TypeScript para el sistema
export type ModernColorScale = keyof typeof MODERN_COLORS.gray;
export type ModernFontSize = keyof typeof MODERN_TYPOGRAPHY.fontSize;
export type ModernSpacing = keyof typeof MODERN_SPACING;
export type ModernRadius = keyof typeof MODERN_RADIUS;
export type ModernButtonSize = keyof typeof MODERN_COMPONENTS.button.sizes;
export type ModernButtonVariant = keyof typeof MODERN_COMPONENTS.button.variants;
export type ModernCardVariant = keyof typeof MODERN_COMPONENTS.card.variants;
export type ModernInputVariant = keyof typeof MODERN_COMPONENTS.input.variants; 