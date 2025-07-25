import type { ThemeStatCardVariant } from '@/constants/theme/index.constants';

/**
 * Utilidades genéricas para StatCard
 * Reutilizable en ExerciseStats, Dashboard, Analytics, etc.
 */

/**
 * Formatea un número como estadística con sufijos apropiados
 */
export const formatStatValue = (value: number, options?: {
  decimals?: number;
  suffix?: string;
  prefix?: string;
  showSign?: boolean;
}): string => {
  const { decimals = 0, suffix = '', prefix = '', showSign = false } = options || {};

  let formattedValue: string;

  // Formatear números grandes con sufijos
  if (Math.abs(value) >= 1000000) {
    formattedValue = (value / 1000000).toFixed(decimals) + 'M';
  } else if (Math.abs(value) >= 1000) {
    formattedValue = (value / 1000).toFixed(decimals) + 'K';
  } else {
    formattedValue = value.toFixed(decimals);
  }

  // Agregar signo si se solicita
  if (showSign && value > 0) {
    formattedValue = '+' + formattedValue;
  }

  return `${prefix}${formattedValue}${suffix}`;
};

/**
 * Formatea porcentajes con precisión controlada
 */
export const formatPercentage = (value: number, decimals = 1): string => {
  return formatStatValue(value, { decimals, suffix: '%', showSign: value !== 0 });
};

/**
 * Formatea duración en formato legible
 */
export const formatDuration = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds}s`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
};

/**
 * Selecciona automáticamente la variante de color basándose en el contexto
 */
export const getVariantByContext = (context: string): ThemeStatCardVariant => {
  const contextMap: Record<string, ThemeStatCardVariant> = {
    // Métricas de rendimiento
    weight: 'primary',
    reps: 'success',
    sets: 'warning',
    volume: 'danger',

    // Métricas de tiempo
    duration: 'secondary',
    frequency: 'primary',

    // Métricas de progreso
    improvement: 'success',
    total: 'secondary',

    // Fallbacks
    default: 'primary'
  };

  return contextMap[context.toLowerCase()] || contextMap.default;
};

/**
 * Selecciona variante basándose en el valor numérico (positivo/negativo/neutro)
 */
export const getVariantByValue = (
  value: number,
  options?: {
    positiveVariant?: ThemeStatCardVariant;
    negativeVariant?: ThemeStatCardVariant;
    neutralVariant?: ThemeStatCardVariant;
  }
): ThemeStatCardVariant => {
  const {
    positiveVariant = 'success',
    negativeVariant = 'danger',
    neutralVariant = 'primary'
  } = options || {};

  if (value > 0) return positiveVariant;
  if (value < 0) return negativeVariant;
  return neutralVariant;
};

/**
 * Genera datos de StatCard desde un objeto de estadísticas
 */
export const createStatCardData = (stats: Record<string, number>, config?: {
  formatters?: Record<string, (value: number) => string>;
  variants?: Record<string, ThemeStatCardVariant>;
  titles?: Record<string, string>;
}) => {
  const { formatters = {}, variants = {}, titles = {} } = config || {};

  return Object.entries(stats).map(([key, value]) => ({
    key,
    title: titles[key] || key.charAt(0).toUpperCase() + key.slice(1),
    value: formatters[key] ? formatters[key](value) : value.toString(),
    variant: variants[key] || getVariantByContext(key)
  }));
};

/**
 * Calcula el cambio porcentual entre dos valores
 */
export const calculatePercentageChange = (oldValue: number, newValue: number): number => {
  if (oldValue === 0) return newValue > 0 ? 100 : 0;
  return ((newValue - oldValue) / oldValue) * 100;
};

/**
 * Determina si un cambio es significativo basándose en un threshold
 */
export const isSignificantChange = (
  oldValue: number,
  newValue: number,
  threshold = 5
): boolean => {
  const change = Math.abs(calculatePercentageChange(oldValue, newValue));
  return change >= threshold;
};

/**
 * Formatea un valor de peso con unidad
 */
export const formatWeight = (value: number, unit = 'kg'): string => {
  return formatStatValue(value, { decimals: value % 1 === 0 ? 0 : 1, suffix: unit });
};

/**
 * Formatea un valor de repeticiones
 */
export const formatReps = (value: number): string => {
  return formatStatValue(value, { suffix: value === 1 ? ' rep' : ' reps' });
};

/**
 * Formatea un valor de series
 */
export const formatSets = (value: number): string => {
  return formatStatValue(value, { suffix: value === 1 ? ' serie' : ' series' });
}; 