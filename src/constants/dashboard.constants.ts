/**
 * Constantes globales para componentes del Dashboard
 * Centraliza valores compartidos entre múltiples componentes
 */

// ===== CONSTANTES DE COLORES Y ESTILOS =====

export const DASHBOARD_COLORS = {
  // Colores por categoría
  CATEGORY_COLORS: {
    'Pecho': 'from-red-500 to-red-700',
    'Espalda': 'from-blue-500 to-blue-700',
    'Piernas': 'from-green-500 to-green-700',
    'Hombros': 'from-purple-500 to-purple-700',
    'Brazos': 'from-orange-500 to-orange-700',
    'Core': 'from-indigo-500 to-indigo-700',
    'default': 'from-gray-500 to-gray-700',
  },

  // Colores por estado
  STATUS_COLORS: {
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',
    secondary: '#6b7280',
  },

  // Colores por prioridad
  PRIORITY_COLORS: {
    high: 'bg-red-600 text-white',
    medium: 'bg-yellow-600 text-white',
    low: 'bg-gray-600 text-white',
  },

  // Colores por tipo de indicador
  INDICATOR_COLORS: {
    excellent: 'bg-green-900/20 border-green-500/30 text-green-400',
    good: 'bg-blue-900/20 border-blue-500/30 text-blue-400',
    warning: 'bg-yellow-900/20 border-yellow-500/30 text-yellow-400',
    critical: 'bg-red-900/20 border-red-500/30 text-red-400',
  },
} as const;

// ===== CONSTANTES DE CATEGORÍAS DE OPTIMIZACIÓN =====

export const OPTIMIZATION_CATEGORIES = {
  intensity: 'bg-red-900/20 border-red-500/30 text-red-400',
  recovery: 'bg-green-900/20 border-green-500/30 text-green-400',
  frequency: 'bg-purple-900/20 border-purple-500/30 text-purple-400',
  planning: 'bg-indigo-900/20 border-indigo-500/30 text-indigo-400',
  progress: 'bg-blue-900/20 border-blue-500/30 text-blue-400',
  technique: 'bg-yellow-900/20 border-yellow-500/30 text-yellow-400',
  balance: 'bg-cyan-900/20 border-cyan-500/30 text-cyan-400',
  default: 'bg-gray-900/20 border-gray-500/30 text-gray-400',
} as const;

// ===== CONSTANTES DE TENDENCIAS =====

export const TREND_TYPES = {
  up: 'up',
  down: 'down',
  stable: 'stable',
} as const;

export const TREND_LABELS = {
  up: 'Mejorando',
  down: 'Declinando',
  stable: 'Estable',
} as const;

export const TREND_COLORS = {
  up: 'text-green-400',
  down: 'text-red-400',
  stable: 'text-gray-400',
} as const;

// ===== CONSTANTES DE NIVELES DE BALANCE =====

export const BALANCE_LEVELS = {
  excellent: 'excellent',
  good: 'good',
  unbalanced: 'unbalanced',
  critical: 'critical',
} as const;

export const BALANCE_LABELS = {
  excellent: 'EXCELENTE',
  good: 'BUENO',
  unbalanced: 'DESEQUILIBRADO',
  critical: 'CRÍTICO',
} as const;

// ===== CONSTANTES DE PRIORIDADES =====

export const PRIORITY_LEVELS = {
  high: 'high',
  medium: 'medium',
  low: 'low',
} as const;

export const PRIORITY_LABELS = {
  high: 'Alta',
  medium: 'Media',
  low: 'Baja',
} as const;

// ===== CONSTANTES DE TIPOS DE INDICADORES =====

export const INDICATOR_TYPES = {
  excellent: 'excellent',
  good: 'good',
  warning: 'warning',
  critical: 'critical',
} as const;

// ===== CONSTANTES DE ESTADOS DE FATIGA =====

export const FATIGUE_LEVELS = {
  LOW: 30,
  MODERATE: 70,
  HIGH: 100,
} as const;

export const FATIGUE_LABELS = {
  LOW: 'Baja',
  MODERATE: 'Moderada',
  HIGH: 'Alta',
} as const;

// ===== CONSTANTES DE RIESGO DE MESETA =====

export const PLATEAU_RISK_LEVELS = {
  LOW: 30,
  MODERATE: 60,
  HIGH: 100,
} as const;

// ===== CONSTANTES DE CONFIANZA =====

export const CONFIDENCE_LEVELS = {
  EXCELLENT: 80,
  GOOD: 60,
  MODERATE: 40,
  LOW: 20,
} as const;

// ===== CONSTANTES DE PROGRESO =====

export const PROGRESS_THRESHOLDS = {
  EXCELLENT: 5,
  IMPROVING: 0,
  DECLINING: -5,
} as const;

// ===== CONSTANTES DE MÉTRICAS =====

export const METRIC_UNITS = {
  WEIGHT: 'kg',
  PERCENTAGE: '%',
  FREQUENCY: '/sem',
  SESSIONS: 'entrenamientos',
  RECORDS: 'PRs',
} as const;

// ===== CONSTANTES DE VALIDACIÓN =====

export const VALIDATION_LIMITS = {
  MIN_WORKOUTS_FOR_ANALYSIS: 10,
  MIN_WEEKS_FOR_TRENDS: 4,
  MAX_PROGRESS_PERCENTAGE: 200,
  MIN_PROGRESS_PERCENTAGE: 50,
} as const;

// ===== CONSTANTES DE TEXTO =====

export const DASHBOARD_TEXTS = {
  EMPTY_STATES: {
    NO_DATA: 'Sin datos para mostrar',
    NO_HISTORY: 'Sin historial de entrenamientos',
    NO_EXERCISES: 'Sin datos para análisis de ejercicios',
    NO_BALANCE: 'Sin datos para análisis de balance',
    NO_ADVANCED: 'Sin datos para análisis avanzado',
  },
  MESSAGES: {
    REGISTER_WORKOUTS: 'Registra algunos entrenamientos para ver tu progreso',
    REGISTER_MORE_WORKOUTS: 'Registra entrenamientos durante varias semanas para ver tu historial',
    NO_CONNECTION: 'Sin conexión - No se pueden cargar los datos',
    LOADING: 'Cargando dashboard...',
    UNKNOWN_RECORDS: 'registros no se incluyen en el análisis por falta de información de ejercicio',
  },
} as const;
