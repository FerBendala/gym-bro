/**
 * Constantes de tema para el sistema de diseño
 * Colores, tamaños y estilos reutilizables en toda la aplicación
 */

import type { UISize, UIVariant } from '../interfaces/ui';

export const THEME_COLORS = {
  variants: {
    default: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-700 text-gray-200 hover:bg-gray-600 focus:ring-gray-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    warning: 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    ghost: 'text-gray-300 hover:text-white hover:bg-gray-800 focus:ring-gray-500'
  } satisfies Record<UIVariant, string>,
  sizes: {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  } satisfies Record<UISize, string>,
  focus: 'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900',
  disabled: 'disabled:opacity-50 disabled:cursor-not-allowed',
  transition: 'transition-colors'
} as const;

/**
 * Sistema de spacing genérico para componentes
 * Reutilizable en Card, Modal, Panel, etc.
 */
export const THEME_SPACING = {
  padding: {
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

/**
 * Estilos genéricos para contenedores tipo Card
 * Reutilizable en Card, Modal, Panel, Dropdown, etc.
 */
export const THEME_CONTAINERS = {
  card: {
    base: 'rounded-lg border shadow-lg',
    variants: {
      default: 'bg-gray-800 border-gray-700',
      primary: 'bg-gray-800 border-gray-700',
      secondary: 'bg-gray-900 border-gray-600',
      success: 'bg-green-900/20 border-green-700',
      warning: 'bg-yellow-900/20 border-yellow-700',
      danger: 'bg-red-900/20 border-red-700',
      ghost: 'bg-transparent border-gray-700'
    } satisfies Record<UIVariant, string>
  },
  modal: {
    overlay: 'fixed inset-0 bg-black/50 flex items-end lg:items-center justify-center p-0 lg:p-4 z-50',
    container: 'w-full h-full lg:h-auto lg:max-h-[90vh] bg-gray-900 rounded-t-lg lg:rounded-lg lg:max-w-4xl xl:max-w-6xl overflow-hidden',
    header: 'flex items-center justify-between p-4 sm:p-6 border-b border-gray-700',
    content: 'overflow-y-auto h-[calc(100vh-80px)] lg:max-h-[calc(90vh-80px)] p-4 sm:p-6'
  },
  alert: {
    base: 'rounded-lg p-3 mb-3',
    variants: {
      warning: 'bg-yellow-900/20 border border-yellow-700',
      error: 'bg-red-900/20 border border-red-700',
      info: 'bg-blue-900/20 border border-blue-700',
      success: 'bg-green-900/20 border border-green-700'
    }
  },
  divider: 'border-gray-700'
} as const;

/**
 * Sistema de colores genérico para gráficos y visualizaciones
 * Reutilizable en ExerciseProgressChart, Dashboard charts, etc.
 */
export const THEME_CHART = {
  colors: [
    'rgb(59, 130, 246)',   // blue
    'rgb(16, 185, 129)',   // green  
    'rgb(245, 158, 11)',   // yellow
    'rgb(239, 68, 68)',    // red
    'rgb(139, 92, 246)',   // purple
    'rgb(236, 72, 153)',   // pink
    'rgb(20, 184, 166)',   // teal
    'rgb(251, 113, 133)'   // rose
  ],
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

/**
 * Sistema de colores genérico para estadísticas
 * Reutilizable en ExerciseStats, StatCard, Dashboard, etc.
 */
export const THEME_STATS = {
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

/**
 * Sistema de estilos genéricos para inputs y formularios
 * Reutilizable en Input, Select, Textarea, etc.
 */
export const THEME_INPUT = {
  base: 'block w-full rounded-lg text-white placeholder-gray-500 transition-colors',
  background: 'bg-gray-800',
  border: {
    default: 'border border-gray-700',
    focus: 'focus:border-transparent',
    error: 'border-red-500'
  },
  focus: {
    default: 'focus:outline-none focus:ring-2 focus:ring-blue-500',
    error: 'focus:ring-red-500'
  },
  sizes: {
    sm: 'px-2 py-1.5 text-sm',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base'
  },
  variants: {
    default: '',
    filled: 'bg-gray-700 border-gray-600',
    outline: 'bg-transparent border-2'
  },
  validation: {
    error: 'border-red-500 focus:ring-red-500',
    success: 'border-green-500 focus:ring-green-500',
    warning: 'border-yellow-500 focus:ring-yellow-500'
  }
} as const;

/**
 * Sistema de estilos genéricos para labels y texto de formularios
 * Reutilizable en cualquier componente de formulario
 */
export const THEME_FORM = {
  label: {
    base: 'block font-medium',
    sizes: {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base'
    },
    colors: {
      default: 'text-gray-300',
      error: 'text-red-400',
      success: 'text-green-400'
    }
  },
  error: {
    base: 'text-red-400',
    sizes: {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base'
    }
  },
  helper: {
    base: 'text-gray-500',
    sizes: {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base'
    }
  }
} as const;

/**
 * Sistema de estilos genéricos para loading spinners
 * Reutilizable en Button, overlays, estados de carga, etc.
 */
export const THEME_SPINNER = {
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
  },
  variants: {
    default: '',
    light: 'opacity-75',
    subtle: 'opacity-50'
  }
} as const;

/**
 * Sistema de estilos genéricos para notificaciones
 * Reutilizable en Notification, Toast, Alert, etc.
 */
export const THEME_NOTIFICATION = {
  base: 'fixed top-4 right-4 z-50 animate-slide-in',
  container: 'border rounded-lg p-4 max-w-sm shadow-lg backdrop-blur-sm',
  content: 'flex items-start',
  icon: 'w-5 h-5 text-white mt-0.5 mr-3 flex-shrink-0',
  message: {
    base: 'text-white text-sm font-medium leading-relaxed',
    helper: 'text-white/80 text-xs mt-1'
  },
  closeButton: 'ml-2 text-white/80 hover:text-white transition-colors p-1 rounded-md hover:bg-white/10',
  closeIcon: 'w-4 h-4',
  progressBar: {
    container: 'mt-3 h-1 bg-white/20 rounded-full overflow-hidden',
    bar: 'h-full bg-white/60 rounded-full animate-progress'
  },
  types: {
    success: {
      background: 'bg-green-600 border-green-500 shadow-green-500/20',
      duration: 4000
    },
    error: {
      background: 'bg-red-600 border-red-500 shadow-red-500/20',
      duration: 6000
    },
    warning: {
      background: 'bg-yellow-600 border-yellow-500 shadow-yellow-500/20',
      duration: 4000
    },
    info: {
      background: 'bg-blue-600 border-blue-500 shadow-blue-500/20',
      duration: 4000
    }
  }
} as const;

/**
 * Sistema de estilos genéricos para entrenamientos
 * Reutilizable en RecentWorkouts, WorkoutCalendar, WorkoutCard, etc.
 * Con soporte completo responsive: vertical en móvil, horizontal en desktop
 */
export const THEME_WORKOUTS = {
  container: 'space-y-3',
  item: {
    // Layout responsive: vertical en móvil, horizontal en desktop
    base: 'flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors space-y-3 sm:space-y-0',
    content: 'flex items-center space-x-4',
    details: 'flex flex-col sm:flex-row sm:items-center sm:text-right space-y-2 sm:space-y-0 sm:space-x-4'
  },
  icon: {
    container: 'p-2 bg-blue-600/20 rounded-lg flex-shrink-0',
    base: 'w-5 h-5 text-blue-400'
  },
  info: {
    title: 'font-medium text-white',
    metadata: 'flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-400 mt-1',
    metaItem: 'flex items-center whitespace-nowrap',
    metaIcon: 'w-3 h-3 mr-1 flex-shrink-0'
  },
  details: {
    container: 'flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4',
    stats: 'flex flex-col sm:text-right space-y-1',
    primary: 'text-white font-medium text-base sm:text-sm',
    volume: 'text-sm sm:text-xs',
    indicator: 'flex items-center justify-start sm:justify-end text-gray-400 mt-2 sm:mt-0',
    indicatorIcon: 'w-4 h-4 mr-1 sm:mr-0 sm:ml-1'
  },
  emptyState: {
    container: 'text-center py-8',
    iconWrapper: 'p-4 bg-gray-800 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center',
    icon: 'w-8 h-8 text-gray-400',
    message: 'text-gray-400'
  },
  footer: {
    container: 'text-center pt-4',
    message: 'text-sm text-gray-400'
  },
  volume: {
    colors: {
      bajo: 'text-gray-400',
      moderado: 'text-blue-400',
      alto: 'text-green-400',
      muy_alto: 'text-yellow-400',
      extremo: 'text-red-400'
    },
    backgrounds: {
      bajo: 'bg-gray-400/10',
      moderado: 'bg-blue-400/10',
      alto: 'bg-green-400/10',
      muy_alto: 'bg-yellow-400/10',
      extremo: 'bg-red-400/10'
    }
  }
} as const;

/**
 * Sistema de estilos genéricos para selects
 * Integrado completamente con THEME_FORM y THEME_INPUT para máxima consistencia
 * Reutilizable en formularios, filtros, configuraciones, etc.
 */
export const THEME_SELECT = {
  container: 'space-y-1',
  base: 'block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none transition-colors',
  focus: 'focus:ring-2 focus:border-transparent',
  sizes: {
    sm: 'px-2 py-1 text-sm',
    md: 'px-3 py-2 text-base',
    lg: 'px-4 py-3 text-lg'
  },
  variants: {
    default: 'bg-gray-800 border-gray-700',
    filled: 'bg-gray-700 border-gray-600',
    outline: 'bg-transparent border-gray-600'
  },
  validation: {
    default: 'focus:ring-blue-500 focus:border-blue-500',
    success: 'border-green-500 focus:ring-green-500 focus:border-green-500',
    warning: 'border-yellow-500 focus:ring-yellow-500 focus:border-yellow-500',
    error: 'border-red-500 focus:ring-red-500 focus:border-red-500'
  },
  option: {
    base: 'text-white bg-gray-800',
    disabled: 'text-gray-500',
    selected: 'bg-blue-600'
  },
  placeholder: {
    base: 'text-gray-400',
    disabled: 'text-gray-600'
  }
} as const;

/**
 * Sistema de estilos genéricos expandido para tarjetas de estadísticas
 * Integrado completamente con THEME_SPACING y estructura modular
 */
export const THEME_STAT_CARD = {
  container: {
    base: 'flex items-center space-x-3'
  },
  icon: {
    container: 'p-2 rounded-lg',
    sizes: {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6'
    }
  },
  content: {
    container: 'min-w-0 flex-1',
    title: {
      base: 'text-gray-400 truncate',
      sizes: {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base'
      }
    },
    value: {
      base: 'font-bold text-white truncate',
      sizes: {
        sm: 'text-sm',
        md: 'text-lg',
        lg: 'text-xl'
      }
    }
  },
  padding: {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  },
  variants: THEME_STATS
} as const;

/**
 * Sistema de estilos genéricos para tabs/navegación
 * Reutilizable en TabNavigation, segmented controls, breadcrumbs, etc.
 */
export const THEME_TABS = {
  container: {
    base: 'bg-gray-800 border-b border-gray-700',
    scroll: 'overflow-x-auto',
    inner: 'flex space-x-1 px-4 py-2 min-w-max max-w-7xl mx-auto'
  },
  tab: {
    base: 'px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap',
    active: 'bg-blue-600 text-white',
    inactive: 'text-gray-400 hover:text-white hover:bg-gray-700'
  },
  sizes: {
    sm: 'px-2 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  },
  variants: {
    default: {
      active: 'bg-blue-600 text-white',
      inactive: 'text-gray-400 hover:text-white hover:bg-gray-700'
    },
    primary: {
      active: 'bg-blue-600 text-white',
      inactive: 'text-blue-400 hover:text-white hover:bg-blue-800'
    },
    secondary: {
      active: 'bg-gray-600 text-white',
      inactive: 'text-gray-400 hover:text-white hover:bg-gray-600'
    },
    success: {
      active: 'bg-green-600 text-white',
      inactive: 'text-green-400 hover:text-white hover:bg-green-800'
    }
  }
} as const;

/**
 * Sistema de estilos genéricos para URL previews
 * Reutilizable en URLPreview, LinkCard, MediaEmbed, etc.
 */
export const THEME_URL_PREVIEW = {
  compact: {
    container: 'flex items-center space-x-3 p-3 rounded-lg border transition-colors hover:bg-gray-750',
    clickable: 'cursor-pointer',
    icon: 'flex-shrink-0',
    iconSize: 'w-4 h-4',
    content: 'flex-1 min-w-0',
    title: 'text-sm font-medium text-white truncate',
    url: 'text-xs text-gray-400 truncate',
    thumbnail: 'flex-shrink-0',
    thumbnailImg: 'w-12 h-12 object-cover rounded border border-gray-600',
    externalIcon: 'flex-shrink-0 w-4 h-4 text-gray-400'
  },
  loading: {
    container: 'flex items-center space-x-2 p-2 bg-gray-800 rounded-lg border border-gray-700',
    icon: 'w-4 h-4 text-gray-400',
    message: 'text-sm text-gray-400 truncate flex-1'
  },
  full: {
    overlay: 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50',
    container: 'bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden',
    header: 'flex items-center justify-between p-4 border-b border-gray-700',
    title: 'text-lg font-semibold text-white',
    content: 'p-4',
    footer: 'p-4 border-t border-gray-700 bg-gray-800',
    footerContent: 'flex items-center justify-between',
    url: 'text-sm text-gray-400 truncate flex-1 mr-4'
  },
  media: {
    iframe: 'w-full h-full rounded-lg',
    video: 'w-full h-full rounded-lg',
    image: 'max-w-full max-h-[60vh] object-contain rounded-lg',
    aspectVideo: 'aspect-video',
    centeredImage: 'flex justify-center'
  },
  website: {
    container: 'text-center py-8',
    icon: 'w-16 h-16 text-gray-400 mx-auto mb-4',
    description: 'text-gray-300 mb-4',
    button: 'inline-flex items-center'
  },
  types: {
    youtube: {
      colors: 'bg-red-600/20 text-red-400 border-red-600/30',
      background: 'bg-red-600/20',
      text: 'text-red-400',
      border: 'border-red-600/30'
    },
    video: {
      colors: 'bg-purple-600/20 text-purple-400 border-purple-600/30',
      background: 'bg-purple-600/20',
      text: 'text-purple-400',
      border: 'border-purple-600/30'
    },
    image: {
      colors: 'bg-green-600/20 text-green-400 border-green-600/30',
      background: 'bg-green-600/20',
      text: 'text-green-400',
      border: 'border-green-600/30'
    },
    website: {
      colors: 'bg-blue-600/20 text-blue-400 border-blue-600/30',
      background: 'bg-blue-600/20',
      text: 'text-blue-400',
      border: 'border-blue-600/30'
    },
    default: {
      colors: 'bg-gray-600/20 text-gray-400 border-gray-600/30',
      background: 'bg-gray-600/20',
      text: 'text-gray-400',
      border: 'border-gray-600/30'
    }
  }
} as const;

/**
 * Sistema de estilos genéricos para calendarios
 * Reutilizable en WorkoutCalendar, EventCalendar, DatePicker, etc.
 */
export const THEME_CALENDAR = {
  container: 'space-y-4',
  header: {
    container: 'flex items-center justify-between',
    title: 'text-lg font-medium text-white',
    navigation: 'flex space-x-2',
    navButton: 'w-4 h-4'
  },
  weekdays: {
    container: 'grid grid-cols-7 gap-1 text-center',
    day: 'p-2 text-xs font-medium text-gray-400'
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
      dot: 'w-1 h-1 bg-white rounded-full'
    }
  },
  intensity: {
    none: 'bg-gray-800',
    low: 'bg-blue-900/50',
    medium: 'bg-blue-700/70',
    high: 'bg-blue-600/80',
    veryHigh: 'bg-blue-500'
  },
  legend: {
    container: 'flex items-center justify-between text-xs text-gray-400',
    label: '',
    dots: 'flex space-x-1',
    dot: 'w-3 h-3 rounded'
  },
  stats: {
    container: 'pt-4 border-t border-gray-700',
    grid: 'grid grid-cols-2 gap-4 text-center',
    item: {
      value: 'text-lg font-bold text-white',
      label: 'text-xs text-gray-400'
    }
  },
  weekdayLabels: ['L', 'M', 'X', 'J', 'V', 'S', 'D'],
  intensityLevels: [
    { threshold: 1, className: 'bg-blue-900/50' },
    { threshold: 2, className: 'bg-blue-700/70' },
    { threshold: 3, className: 'bg-blue-600/80' },
    { threshold: Infinity, className: 'bg-blue-500' }
  ]
} as const;

/**
 * Sistema de diseño responsive completo
 * Mobile-first approach con breakpoints estándar y utilidades adaptativas
 * Sigue las mejores prácticas de responsive design
 */
export const THEME_RESPONSIVE = {
  // Breakpoints estándar mobile-first
  breakpoints: {
    sm: '640px',   // Móvil grande / Tablet pequeña
    md: '768px',   // Tablet
    lg: '1024px',  // Desktop pequeño
    xl: '1280px',  // Desktop
    '2xl': '1536px' // Desktop grande
  },

  // Container responsivo que reemplaza max-w-7xl
  container: {
    base: 'w-full mx-auto px-4',
    maxWidths: {
      sm: 'sm:max-w-none',
      md: 'md:max-w-none',
      lg: 'lg:max-w-6xl',
      xl: 'xl:max-w-7xl',
      '2xl': '2xl:max-w-7xl'
    },
    padding: {
      sm: 'px-4 sm:px-6',
      md: 'px-4 md:px-6',
      lg: 'px-4 lg:px-8',
      xl: 'px-4 xl:px-8'
    }
  },

  // Spacing responsive
  spacing: {
    section: {
      mobile: 'py-8',
      tablet: 'md:py-12',
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
  },

  // Typography responsive
  typography: {
    h1: {
      mobile: 'text-2xl',
      tablet: 'md:text-3xl',
      desktop: 'lg:text-4xl',
      weight: 'font-bold',
      leading: 'leading-tight'
    },
    h2: {
      mobile: 'text-xl',
      tablet: 'md:text-2xl',
      desktop: 'lg:text-3xl',
      weight: 'font-semibold',
      leading: 'leading-tight'
    },
    h3: {
      mobile: 'text-lg',
      tablet: 'md:text-xl',
      desktop: 'lg:text-2xl',
      weight: 'font-medium',
      leading: 'leading-snug'
    },
    body: {
      mobile: 'text-sm',
      tablet: 'md:text-base',
      weight: 'font-normal',
      leading: 'leading-relaxed'
    },
    small: {
      mobile: 'text-xs',
      tablet: 'md:text-sm',
      weight: 'font-normal',
      leading: 'leading-normal'
    }
  },

  // Grid systems responsive
  grid: {
    cols1: 'grid-cols-1',
    cols2: 'grid-cols-1 md:grid-cols-2',
    cols3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    cols4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    colsAuto: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-auto',
    gap: 'gap-4 md:gap-6 lg:gap-8'
  },

  // Touch targets y interacción móvil
  touch: {
    // Targets mínimos 44px según guidelines
    minTarget: 'min-h-[44px] min-w-[44px]',
    button: {
      mobile: 'px-4 py-3 text-base',
      tablet: 'md:px-4 md:py-2 md:text-sm'
    },
    input: {
      mobile: 'px-4 py-3 text-base',
      tablet: 'md:px-3 md:py-2 md:text-sm'
    },
    tab: {
      mobile: 'px-6 py-3 text-base',
      tablet: 'md:px-4 md:py-2 md:text-sm'
    }
  },

  // Navegación responsive
  navigation: {
    mobile: {
      container: 'overflow-x-auto scrollbar-hide',
      inner: 'flex space-x-1 px-4 py-3 min-w-max',
      item: 'flex-shrink-0'
    },
    desktop: {
      container: 'max-w-7xl mx-auto',
      inner: 'flex space-x-1 px-4 py-2',
      item: ''
    }
  },

  // Cards responsive
  card: {
    container: 'w-full',
    padding: 'p-4 sm:p-6',
    spacing: 'space-y-4 sm:space-y-6',
    grid: 'grid gap-4 sm:gap-6'
  },

  // Utilidades de visibilidad por dispositivo
  visibility: {
    mobileOnly: 'block sm:hidden',
    tabletUp: 'hidden sm:block',
    desktopOnly: 'hidden lg:block',
    mobileToTablet: 'block lg:hidden'
  }
} as const;

export type ThemeCardVariant = keyof typeof THEME_CONTAINERS.card.variants;
export type ThemeSpacingSize = keyof typeof THEME_SPACING.padding;
export type ThemeAlertVariant = keyof typeof THEME_CONTAINERS.alert.variants;
export type ThemeStatsVariant = keyof typeof THEME_STATS;
export type ThemeInputSize = keyof typeof THEME_INPUT.sizes;
export type ThemeInputVariant = keyof typeof THEME_INPUT.variants;
export type ThemeInputValidation = keyof typeof THEME_INPUT.validation;
export type ThemeSpinnerSize = keyof typeof THEME_SPINNER.sizes;
export type ThemeSpinnerColor = keyof typeof THEME_SPINNER.colors;
export type ThemeSpinnerVariant = keyof typeof THEME_SPINNER.variants;
export type ThemeNotificationType = keyof typeof THEME_NOTIFICATION.types;
export type ThemeVolumeLevel = keyof typeof THEME_WORKOUTS.volume.colors;
export type ThemeSelectSize = keyof typeof THEME_SELECT.sizes;
export type ThemeSelectVariant = keyof typeof THEME_SELECT.variants;
export type ThemeSelectValidation = keyof typeof THEME_SELECT.validation;
export type ThemeStatCardSize = keyof typeof THEME_STAT_CARD.padding;
export type ThemeStatCardVariant = keyof typeof THEME_STAT_CARD.variants;
export type ThemeTabSize = keyof typeof THEME_TABS.sizes;
export type ThemeTabVariant = keyof typeof THEME_TABS.variants;
export type ThemeUrlPreviewType = keyof typeof THEME_URL_PREVIEW.types;
export type ThemeCalendarIntensity = keyof typeof THEME_CALENDAR.intensity; 