/**
 * Estilos de componentes del tema
 * Estilos base para botones, inputs, cards, etc.
 */

// Variantes de componentes
export const UI_VARIANTS = {
  default: 'default',
  primary: 'primary',
  secondary: 'secondary',
  success: 'success',
  warning: 'warning',
  danger: 'danger',
  ghost: 'ghost',
} as const;

// Componentes base modernos
export const COMPONENTS = {
  button: {
    base: 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed',

    sizes: {
      sm: 'px-3 py-1.5 text-sm min-h-[36px]',
      md: 'px-4 py-2 text-sm min-h-[40px]',
      lg: 'px-6 py-3 text-base min-h-[44px]',
      xl: 'px-8 py-4 text-lg min-h-[48px]',
    },

    variants: {
      primary: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl focus:ring-blue-500 active:scale-95',
      secondary: 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 hover:border-gray-600 focus:ring-gray-500 active:scale-95',
      ghost: 'hover:bg-gray-800 text-gray-300 hover:text-white focus:ring-gray-500 active:scale-95',
      danger: 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl focus:ring-red-500 active:scale-95',
      success: 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl focus:ring-green-500 active:scale-95',
    },
  },

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

  input: {
    base: 'block w-full rounded-lg border bg-gray-800/50 backdrop-blur-sm text-white placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900',
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
  },

  modal: {
    overlay: 'fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[70]',
    container: 'bg-gray-900/95 backdrop-blur-md rounded-2xl border border-gray-700/50 shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden',
    header: 'flex items-center justify-between p-6 border-b border-gray-700/50',
    content: 'overflow-y-auto',
    footer: 'flex items-center justify-end gap-3 p-6 border-t border-gray-700/50',
  },

  spinner: {
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
  },

  tabs: {
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
  },
} as const;

// Tipos TypeScript
export type ButtonSize = keyof typeof COMPONENTS.button.sizes;
export type ButtonVariant = keyof typeof COMPONENTS.button.variants;
export type CardVariant = keyof typeof COMPONENTS.card.variants;
export type CardPadding = keyof typeof COMPONENTS.card.padding;
export type InputSize = keyof typeof COMPONENTS.input.sizes;
export type InputVariant = keyof typeof COMPONENTS.input.variants;
export type SpinnerSize = keyof typeof COMPONENTS.spinner.sizes;
export type SpinnerColor = keyof typeof COMPONENTS.spinner.colors;
export type TabSize = keyof typeof COMPONENTS.tabs.sizes;

// Alias para compatibilidad con ui.constants.ts
export type UIVariant = keyof typeof UI_VARIANTS;

// Constantes legacy para compatibilidad
export const THEME_CALENDAR = {
  container: 'space-y-4',
  header: {
    container: 'flex items-center justify-between',
    title: 'text-lg font-medium text-white',
    navigation: 'flex space-x-2',
    navButton: 'w-4 h-4',
  },
  weekdays: {
    container: 'grid grid-cols-7 gap-1 text-center',
    day: 'p-2 text-xs font-medium text-gray-400',
  },
  grid: {
    container: 'grid grid-cols-7 gap-1',
    day: {
      base: 'relative p-2 h-12 text-center text-sm rounded-lg transition-colors',
      currentMonth: 'text-white',
      otherMonth: 'text-gray-600',
      today: 'ring-2 ring-blue-500',
      hasData: 'cursor-pointer hover:opacity-80',
      content: 'relative z-10',
      indicator: 'absolute bottom-1 left-1/2 transform -translate-x-1/2',
      dot: 'w-1 h-1 bg-white rounded-full',
    },
  },
  intensity: {
    none: 'bg-gray-800',
    low: 'bg-blue-900/50',
    medium: 'bg-blue-700/70',
    high: 'bg-blue-600/80',
    veryHigh: 'bg-blue-500',
  },
  legend: {
    container: 'flex items-center justify-between text-xs text-gray-400',
    label: '',
    dots: 'flex space-x-1',
    dot: 'w-3 h-3 rounded',
  },
  stats: {
    container: 'pt-4 border-t border-gray-700',
    grid: 'grid grid-cols-2 gap-4 text-center',
    item: {
      value: 'text-lg font-bold text-white',
      label: 'text-xs text-gray-400',
    },
  },
  weekdayLabels: ['L', 'M', 'X', 'J', 'V', 'S', 'D'],
  intensityLevels: [
    { threshold: 1, className: 'bg-blue-900/50' },
    { threshold: 2, className: 'bg-blue-700/70' },
    { threshold: 3, className: 'bg-blue-600/80' },
    { threshold: Infinity, className: 'bg-blue-500' },
  ],
} as const;

export const THEME_URL_PREVIEW = {
  compact: {
    container: 'flex items-center space-x-2 p-2 rounded-lg border transition-colors hover:bg-gray-750',
    clickable: 'cursor-pointer',
    icon: 'flex-shrink-0',
    iconSize: 'w-3.5 h-3.5',
    content: 'flex-1 min-w-0',
    title: 'text-xs font-medium text-white truncate',
    url: 'text-xs text-gray-400 truncate hidden sm:block',
    thumbnail: 'flex-shrink-0',
    thumbnailImg: 'w-10 h-10 object-cover rounded border border-gray-600',
    externalIcon: 'flex-shrink-0 w-3.5 h-3.5 text-gray-400',
  },
  loading: {
    container: 'flex items-center space-x-2 p-2 bg-gray-800 rounded-lg border border-gray-700',
    icon: 'w-4 h-4 text-gray-400',
    message: 'text-sm text-gray-400 truncate flex-1',
  },
  full: {
    overlay: 'fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]',
    container: 'bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 rounded-2xl border border-gray-700/50 shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden transform transition-all duration-300',
    header: 'relative bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-blue-600/20 border-b border-gray-700/50 p-6',
    title: 'text-2xl font-bold text-white mb-1 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent',
    content: 'overflow-y-auto max-h-[calc(95vh-180px)] p-6',
    footer: 'border-t border-gray-700/50 p-6 bg-gray-800/30',
    footerContent: 'flex items-center justify-between',
    url: 'text-sm text-gray-400 bg-gray-800/30 px-3 py-1.5 rounded-full border border-gray-600/30 inline-block',
  },
  media: {
    iframe: 'w-full h-full rounded-lg',
    video: 'w-full h-full rounded-lg',
    image: 'max-w-full max-h-[60vh] object-contain rounded-lg',
    aspectVideo: 'aspect-video',
    centeredImage: 'flex justify-center',
  },
  website: {
    container: 'text-center py-8',
    icon: 'w-16 h-16 text-gray-400 mx-auto mb-4',
    description: 'text-gray-300 mb-4',
    button: 'inline-flex items-center',
  },
  types: {
    youtube: {
      colors: 'border-red-700 bg-red-900/20 hover:bg-red-900/30',
    },
    video: {
      colors: 'border-purple-700 bg-purple-900/20 hover:bg-purple-900/30',
    },
    image: {
      colors: 'border-green-700 bg-green-900/20 hover:bg-green-900/30',
    },
    website: {
      colors: 'border-blue-700 bg-blue-900/20 hover:bg-blue-900/30',
    },
    default: {
      colors: 'border-gray-700 bg-gray-800 hover:bg-gray-750',
    },
  },
} as const;
