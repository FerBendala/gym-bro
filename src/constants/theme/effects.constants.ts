/**
 * Efectos visuales del tema
 * Sombras, animaciones, transiciones y efectos
 */

// Bordes redondeados modernos
export const RADIUS = {
  none: '0px',
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '24px',
  '3xl': '32px',
  full: '9999px',
} as const;

// Alias para compatibilidad con ui.constants.ts
export const UI_RADIUS = RADIUS;

// Sombras modernas con mejor profundidad
export const SHADOWS = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
} as const;

// Alias para compatibilidad con ui.constants.ts
export const UI_SHADOWS = SHADOWS;

// Animaciones suaves
export const ANIMATIONS = {
  transition: {
    fast: 'transition-all duration-150 ease-out',
    normal: 'transition-all duration-200 ease-out',
    slow: 'transition-all duration-300 ease-out',
  },

  scale: {
    tap: 'active:scale-95',
    hover: 'hover:scale-105',
    focus: 'focus:scale-105',
  },

  fade: {
    in: 'animate-in fade-in duration-200',
    out: 'animate-out fade-out duration-150',
  },

  slide: {
    up: 'animate-in slide-in-from-bottom-4 duration-300',
    down: 'animate-in slide-in-from-top-4 duration-300',
    left: 'animate-in slide-in-from-right-4 duration-300',
    right: 'animate-in slide-in-from-left-4 duration-300',
  },

  dropDown: {
    in: 'animate-in fade-in slide-in-from-bottom-2 duration-200',
    out: 'animate-out fade-out slide-out-to-bottom-2 duration-150',
  },
} as const;

// Estados de carga modernos
export const LOADING = {
  spinner: {
    base: 'animate-spin rounded-full border-2 border-gray-700',
    sizes: {
      sm: 'h-4 w-4 border-t-gray-400',
      md: 'h-6 w-6 border-t-gray-300',
      lg: 'h-8 w-8 border-t-white',
      xl: 'h-12 w-12 border-t-white',
    },
  },

  skeleton: {
    base: 'animate-pulse bg-gray-800/50 rounded',
    variants: {
      text: 'h-4 w-full',
      title: 'h-6 w-3/4',
      avatar: 'h-10 w-10 rounded-full',
      button: 'h-10 w-24 rounded-lg',
      card: 'h-32 w-full rounded-xl',
    },
  },

  pulse: 'animate-pulse bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-[length:200%_100%] animate-[shimmer_2s_infinite]',
} as const;

// Alias para compatibilidad con ui.constants.ts
export const UI_LOADING = LOADING;

// Accesibilidad mejorada
export const ACCESSIBILITY = {
  focusRing: 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900',
  screenReader: 'sr-only',
  skipLink: 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-lg z-50',

  contrast: {
    high: 'text-white',
    medium: 'text-gray-200',
    low: 'text-gray-400',
  },

  motion: {
    reduce: 'motion-reduce:transition-none motion-reduce:animate-none',
  },
} as const;

// Tipos TypeScript
export type Radius = keyof typeof RADIUS;
export type Shadow = keyof typeof SHADOWS;
export type TransitionSpeed = keyof typeof ANIMATIONS.transition;
export type ScaleEffect = keyof typeof ANIMATIONS.scale;
export type FadeEffect = keyof typeof ANIMATIONS.fade;
export type SlideDirection = keyof typeof ANIMATIONS.slide;
export type LoadingSpinnerSize = keyof typeof LOADING.spinner.sizes;
export type SkeletonVariant = keyof typeof LOADING.skeleton.variants;
export type ContrastLevel = keyof typeof ACCESSIBILITY.contrast;

// Alias para compatibilidad con ui.constants.ts
export type UIRadius = Radius;
export type UIShadow = Shadow;

// Constantes legacy para compatibilidad
export const THEME_CONTAINERS = {
  card: {
    base: 'bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200',
    padding: {
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    },
    variants: {
      default: 'hover:border-gray-600/50',
      active: 'border-blue-500/50 bg-blue-900/10',
      success: 'border-green-500/50 bg-green-900/10',
      warning: 'border-yellow-500/50 bg-yellow-900/10',
      danger: 'border-red-500/50 bg-red-900/10',
    },
  },
  modal: {
    overlay: 'fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[70]',
    container: 'bg-gray-900/95 backdrop-blur-md rounded-2xl border border-gray-700/50 shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden',
    header: 'flex items-center justify-between p-6 border-b border-gray-700/50',
    content: 'overflow-y-auto',
    footer: 'flex items-center justify-end gap-3 p-6 border-t border-gray-700/50',
  },
  alert: {
    base: 'rounded-lg p-3 mb-3',
    variants: {
      warning: 'bg-yellow-900/20 border border-yellow-700',
      error: 'bg-red-900/20 border border-red-700',
      info: 'bg-blue-900/20 border border-blue-700',
      success: 'bg-green-900/20 border border-green-700',
    },
  },
  divider: 'border-gray-700',
} as const;

export const THEME_INPUT = {
  base: 'block w-full rounded-lg text-white placeholder-gray-500 transition-colors',
  background: 'bg-gray-800',
  border: {
    default: 'border border-gray-700',
    focus: 'focus:border-transparent',
    error: 'border-red-500',
  },
  focus: {
    default: 'focus:outline-none focus:ring-2 focus:ring-blue-500',
    error: 'focus:ring-red-500',
  },
  sizes: {
    sm: 'px-3 py-2 text-sm min-h-[36px]',
    md: 'px-4 py-2.5 text-sm min-h-[40px]',
    lg: 'px-4 py-3 text-base min-h-[44px]',
  },
  variants: {
    default: 'border-gray-700/50 focus:border-blue-500 focus:ring-blue-500/20',
    error: 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20',
    success: 'border-green-500/50 focus:border-green-500 focus:ring-green-500/20',
  },
  validation: {
    error: 'border-red-500 focus:ring-red-500',
    success: 'border-green-500 focus:ring-green-500',
    warning: 'border-yellow-500 focus:ring-yellow-500',
  },
} as const;

export const THEME_FORM = {
  label: {
    base: 'block font-medium',
    sizes: {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
    },
    colors: {
      default: 'text-gray-300',
      error: 'text-red-400',
      success: 'text-green-400',
    },
  },
  error: {
    base: 'text-red-400',
    sizes: {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
    },
  },
  helper: {
    base: 'text-gray-500',
    sizes: {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
    },
  },
} as const;

export const THEME_SPINNER = {
  base: 'animate-spin',
  sizes: {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
    xl: 'h-8 w-8',
  },
  colors: {
    default: 'text-current',
    primary: 'text-blue-500',
    success: 'text-green-500',
    warning: 'text-yellow-500',
    danger: 'text-red-500',
    white: 'text-white',
    gray: 'text-gray-400',
  },
  variants: {
    default: '',
    pulse: 'animate-pulse',
    bounce: 'animate-bounce',
  },
} as const;

export const THEME_NOTIFICATION = {
  base: 'fixed top-4 right-4 z-[99999] animate-slide-in',
  container: 'min-w-80 max-w-sm rounded-xl shadow-xl backdrop-blur-sm border',
  content: 'flex items-start space-x-3 p-4',
  icon: 'w-5 h-5 mt-0.5 flex-shrink-0',
  message: {
    base: 'text-sm flex-1 text-white',
    success: 'text-green-100',
    error: 'text-red-100',
    warning: 'text-yellow-100',
    info: 'text-blue-100',
  },
  close: 'ml-auto flex-shrink-0 p-1 rounded-lg hover:bg-white/10 transition-colors duration-200',
  closeIcon: 'w-4 h-4 text-white/70 hover:text-white',
  types: {
    success: {
      background: 'bg-emerald-900/95 border-emerald-600/50',
      duration: 4000,
    },
    error: {
      background: 'bg-red-900/95 border-red-600/50',
      duration: 6000,
    },
    warning: {
      background: 'bg-amber-900/95 border-amber-600/50',
      duration: 5000,
    },
    info: {
      background: 'bg-blue-900/95 border-blue-600/50',
      duration: 4000,
    },
  },
} as const;

export const THEME_WORKOUTS = {
  container: 'space-y-3',
  item: {
    base: 'flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors space-y-3 sm:space-y-0',
    content: 'flex items-center space-x-4',
    details: 'flex flex-col sm:flex-row sm:items-center sm:text-right space-y-2 sm:space-y-0 sm:space-x-4',
  },
  icon: {
    container: 'p-2 bg-blue-600/20 rounded-lg flex-shrink-0',
    base: 'w-5 h-5 text-blue-400',
  },
  info: {
    title: 'font-medium text-white',
    metadata: 'flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-400 mt-1',
    metaItem: 'flex items-center whitespace-nowrap',
    metaIcon: 'w-3 h-3 mr-1 flex-shrink-0',
  },
  details: {
    container: 'flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4',
    stats: 'flex flex-col sm:text-right space-y-1',
    primary: 'text-white font-medium text-base sm:text-sm',
    volume: 'text-sm sm:text-xs',
    indicator: 'flex items-center justify-start sm:justify-end text-gray-400 mt-2 sm:mt-0',
    indicatorIcon: 'w-4 h-4 mr-1 sm:mr-0 sm:ml-1',
  },
  emptyState: {
    container: 'text-center py-8',
    iconWrapper: 'p-4 bg-gray-800 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center',
    icon: 'w-8 h-8 text-gray-400',
    message: 'text-gray-400',
  },
  footer: {
    container: 'text-center pt-4',
    message: 'text-sm text-gray-400',
  },
  volume: {
    colors: {
      bajo: 'text-gray-400',
      moderado: 'text-blue-400',
      alto: 'text-green-400',
      muy_alto: 'text-yellow-400',
      extremo: 'text-red-400',
    },
    backgrounds: {
      bajo: 'bg-gray-400/10',
      moderado: 'bg-blue-400/10',
      alto: 'bg-green-400/10',
      muy_alto: 'bg-yellow-400/10',
      extremo: 'bg-red-400/10',
    },
  },
} as const;

export const THEME_SELECT = {
  container: 'space-y-1',
  base: 'block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none transition-colors',
  focus: 'focus:ring-2 focus:border-transparent',
  sizes: {
    sm: 'px-2 py-1 text-sm',
    md: 'px-3 py-2 text-base',
    lg: 'px-4 py-3 text-lg',
  },
  variants: {
    default: 'bg-gray-800 border-gray-700',
    filled: 'bg-gray-700 border-gray-600',
    outline: 'bg-transparent border-gray-600',
  },
  validation: {
    default: 'focus:ring-blue-500 focus:border-blue-500',
    success: 'border-green-500 focus:ring-green-500 focus:border-green-500',
    warning: 'border-yellow-500 focus:ring-yellow-500 focus:border-yellow-500',
    error: 'border-red-500 focus:ring-red-500 focus:border-red-500',
  },
  option: {
    base: 'text-white bg-gray-800',
    disabled: 'text-gray-500',
    selected: 'bg-blue-600',
  },
  placeholder: {
    base: 'text-gray-400',
    disabled: 'text-gray-600',
  },
} as const;

export const THEME_STAT_CARD = {
  container: {
    base: 'flex items-center space-x-3',
  },
  icon: {
    container: 'p-2 rounded-lg',
    sizes: {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
    },
  },
  content: {
    container: 'min-w-0 flex-1',
    title: {
      base: 'text-gray-400 truncate',
      sizes: {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
      },
    },
    value: {
      base: 'font-bold text-white truncate',
      sizes: {
        sm: 'text-sm',
        md: 'text-lg',
        lg: 'text-xl',
      },
    },
  },
  padding: {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  },
  variants: {
    primary: 'bg-blue-600/20 text-blue-400',
    secondary: 'bg-gray-600/20 text-gray-400',
    success: 'bg-green-600/20 text-green-400',
    warning: 'bg-yellow-600/20 text-yellow-400',
    danger: 'bg-red-600/20 text-red-400',
  },
} as const;

export const THEME_TABS = {
  container: {
    base: 'bg-gray-800 border-b border-gray-700',
    scroll: 'overflow-x-auto',
    inner: 'flex space-x-1 px-4 py-2 min-w-max max-w-7xl mx-auto',
  },
  tab: {
    base: 'px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap',
    active: 'bg-blue-600 text-white',
    inactive: 'text-gray-400 hover:text-white hover:bg-gray-700',
  },
  sizes: {
    sm: 'px-2 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  },
  variants: {
    default: {
      active: 'bg-blue-600 text-white',
      inactive: 'text-gray-400 hover:text-white hover:bg-gray-700',
    },
    primary: {
      active: 'bg-blue-600 text-white',
      inactive: 'text-blue-400 hover:text-white hover:bg-blue-800',
    },
    secondary: {
      active: 'bg-gray-600 text-white',
      inactive: 'text-gray-400 hover:text-white hover:bg-gray-600',
    },
    success: {
      active: 'bg-green-600 text-white',
      inactive: 'text-green-400 hover:text-white hover:bg-green-800',
    },
  },
} as const;

// Tipos legacy para compatibilidad
export type ThemeAlertVariant = keyof typeof THEME_CONTAINERS.alert.variants;
export type ThemeUrlPreviewType = 'youtube' | 'video' | 'image' | 'website' | 'default';

// Tipos para StatCard
export type ThemeStatCardVariant = keyof typeof THEME_STAT_CARD.variants;
export type ThemeStatCardSize = keyof typeof THEME_STAT_CARD.icon.sizes;
