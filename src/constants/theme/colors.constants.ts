/**
 * Sistema de colores del tema
 * Paleta de colores centralizada para toda la aplicación
 */

// Colores base del sistema
export const THEME_COLORS = {
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

// Alias para compatibilidad con ui.constants.ts
export const UI_COLORS = THEME_COLORS;

// Variantes de colores para componentes
export const COLOR_VARIANTS = {
  default: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
  primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
  secondary: 'bg-gray-700 text-gray-200 hover:bg-gray-600 focus:ring-gray-500',
  success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
  warning: 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  ghost: 'text-gray-300 hover:text-white hover:bg-gray-800 focus:ring-gray-500'
} as const;

// Colores para gráficos y visualizaciones
export const CHART_COLORS = [
  'rgb(59, 130, 246)',   // blue
  'rgb(16, 185, 129)',   // green  
  'rgb(245, 158, 11)',   // yellow
  'rgb(239, 68, 68)',    // red
  'rgb(139, 92, 246)',   // purple
  'rgb(236, 72, 153)',   // pink
  'rgb(20, 184, 166)',   // teal
  'rgb(251, 113, 133)'   // rose
] as const;

// Alias para compatibilidad con ui.constants.ts
export const UI_CHART_COLORS = CHART_COLORS;

// Colores para estadísticas
export const STATS_COLORS = {
  primary: {
    icon: 'text-blue-400',
    background: 'bg-blue-600/20'
  },
  success: {
    icon: 'text-green-400',
    background: 'bg-green-600/20'
  },
  warning: {
    icon: 'text-yellow-400',
    background: 'bg-yellow-600/20'
  },
  danger: {
    icon: 'text-red-400',
    background: 'bg-red-600/20'
  },
  purple: {
    icon: 'text-purple-400',
    background: 'bg-purple-600/20'
  },
  indigo: {
    icon: 'text-indigo-400',
    background: 'bg-indigo-600/20'
  },
  pink: {
    icon: 'text-pink-400',
    background: 'bg-pink-600/20'
  },
  teal: {
    icon: 'text-teal-400',
    background: 'bg-teal-600/20'
  }
} as const;

// Tipos TypeScript
export type ColorScale = keyof typeof THEME_COLORS.gray;
export type ColorVariant = keyof typeof COLOR_VARIANTS;
export type StatsColor = keyof typeof STATS_COLORS;

// Alias para compatibilidad con ui.constants.ts
export type UIColorScale = ColorScale;

// Constantes legacy para compatibilidad
export const THEME_CHART = {
  colors: CHART_COLORS,
  grid: {
    color: 'rgb(55, 65, 81)',
    opacity: '0.3'
  },
  axes: {
    color: 'rgb(156, 163, 175)',
    width: '2'
  },
  text: {
    color: 'rgb(156, 163, 175)',
    size: '12'
  }
} as const;

export const THEME_STATS = STATS_COLORS;

// Constante legacy para compatibilidad
export const MODERN_THEME = {
  colors: {
    gray: THEME_COLORS.gray,
    primary: THEME_COLORS.primary,
    success: THEME_COLORS.success,
    danger: THEME_COLORS.danger,
    warning: THEME_COLORS.warning
  },
  typography: {
    fontFamily: {
      sans: 'Inter, system-ui, sans-serif',
      mono: 'JetBrains Mono, monospace'
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem'
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700'
    }
  },
  spacing: {
    px: '1px',
    0: '0',
    0.5: '0.125rem',
    1: '0.25rem',
    1.5: '0.375rem',
    2: '0.5rem',
    2.5: '0.625rem',
    3: '0.75rem',
    3.5: '0.875rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    7: '1.75rem',
    8: '2rem',
    9: '2.25rem',
    10: '2.5rem',
    11: '2.75rem',
    12: '3rem',
    14: '3.5rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
    28: '7rem',
    32: '8rem',
    36: '9rem',
    40: '10rem',
    44: '11rem',
    48: '12rem',
    52: '13rem',
    56: '14rem',
    60: '15rem',
    64: '16rem',
    72: '18rem',
    80: '20rem',
    96: '24rem'
  },
  radius: {
    none: '0',
    sm: '0.125rem',
    base: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px'
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    none: '0 0 #0000'
  },
  layout: {
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
  },
  components: {
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
      overlay: 'fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[70]',
      container: 'bg-gray-900/95 backdrop-blur-md rounded-2xl border border-gray-700/50 shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden',
      header: 'flex items-center justify-between p-6 border-b border-gray-700/50',
      content: 'overflow-y-auto',
      footer: 'flex items-center justify-end gap-3 p-6 border-t border-gray-700/50'
    },
    spinner: {
      base: 'animate-spin',
      sizes: {
        xs: 'h-3 w-3',
        sm: 'h-4 w-4',
        md: 'h-5 w-5',
        lg: 'h-6 w-6',
        xl: 'h-8 w-8'
      },
      colors: {
        default: 'text-current',
        primary: 'text-blue-500',
        success: 'text-green-500',
        warning: 'text-yellow-500',
        danger: 'text-red-500',
        white: 'text-white',
        gray: 'text-gray-400'
      }
    }
  },
  touch: {
    minTarget: 'min-h-[44px] min-w-[44px]',
    padding: {
      sm: 'p-2',
      md: 'p-3',
      lg: 'p-4'
    },
    tap: 'active:scale-95 transition-transform duration-100'
  },
  navigation: {
    bottomNav: {
      container: 'sticky bottom-0 bg-gray-900/95 backdrop-blur-md border-t border-gray-700/50 px-4 py-2 safe-bottom z-40',
      grid: 'grid grid-cols-6 gap-1',
      item: 'flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-all duration-200 min-h-[48px]',
      active: 'bg-blue-600/20 text-blue-400',
      inactive: 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/50'
    },
    bottomNavIconsOnly: {
      container: 'sticky bottom-0 bg-gray-900/95 backdrop-blur-md border-t border-gray-700/50 px-4 py-2 safe-bottom z-40',
      grid: 'grid grid-cols-6 gap-1',
      item: 'flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-all duration-200 min-h-[48px]',
      active: 'bg-blue-600/20 text-blue-400',
      inactive: 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/50',
      scrollContainer: 'overflow-x-auto',
      horizontal: {
        container: 'sticky bottom-0 bg-gray-900/95 backdrop-blur-md border-t border-gray-700/50 px-4 py-2 safe-bottom z-40',
        grid: 'grid grid-cols-6 gap-1',
        item: 'flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-all duration-200 min-h-[48px]',
        active: 'bg-blue-600/20 text-blue-400',
        inactive: 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/50',
        scrollContainer: 'overflow-x-auto'
      }
    },
    bottomNavCompact: {
      container: 'sticky bottom-4 mx-6 bg-gray-900/80 backdrop-blur-md border border-gray-700/50 rounded-[2rem] shadow-2xl z-40',
      grid: 'grid grid-cols-4 gap-2 p-4',
      item: 'flex items-center justify-center p-3 rounded-[1.5rem] transition-all duration-200 min-h-[52px] relative',
      active: 'bg-blue-600/20 text-blue-400 shadow-lg',
      inactive: 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/50'
    },
    moreMenu: {
      container: 'absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900/95 backdrop-blur-md border border-gray-700/50 rounded-xl shadow-2xl p-2 z-50',
      grid: 'grid grid-cols-3 gap-2',
      item: 'flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-200 min-h-[48px]',
      active: 'bg-blue-600/20 text-blue-400',
      inactive: 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/50'
    },
    topNav: {
      container: 'bg-gray-900/95 backdrop-blur-md border-b border-gray-700/50 safe-top',
      content: 'flex items-center justify-between px-4 py-3 min-h-[56px]',
      title: 'text-lg font-semibold text-white',
      actions: 'flex items-center gap-2'
    }
  },
  animations: {
    fade: {
      in: 'animate-fade-in',
      out: 'animate-fade-out'
    },
    slide: {
      up: 'animate-slide-up',
      down: 'animate-slide-down',
      left: 'animate-slide-left',
      right: 'animate-slide-right'
    },
    scale: {
      in: 'animate-scale-in',
      out: 'animate-scale-out'
    },
    dropDown: {
      in: 'animate-dropdown-in',
      out: 'animate-dropdown-out'
    },
    transition: {
      fast: 'transition-all duration-150',
      normal: 'transition-all duration-200',
      slow: 'transition-all duration-300'
    }
  },
  loading: {
    spinner: {
      base: 'animate-spin',
      sizes: {
        xs: 'h-3 w-3',
        sm: 'h-4 w-4',
        md: 'h-5 w-5',
        lg: 'h-6 w-6',
        xl: 'h-8 w-8'
      }
    },
    skeleton: {
      base: 'animate-pulse bg-gray-700 rounded',
      text: 'h-4 bg-gray-700 rounded',
      avatar: 'w-10 h-10 bg-gray-700 rounded-full'
    }
  },
  responsive: {
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
    }
  },
  accessibility: {
    focusRing: 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900',
    srOnly: 'sr-only',
    reducedMotion: 'motion-reduce:transition-none'
  }
} as const; 