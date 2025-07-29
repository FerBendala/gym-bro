import { formatNumberToString } from '@/utils';

/**
 * Utilidades de formateo centralizadas
 * Optimiza el uso excesivo de formatNumberToString en +25 archivos
 */

/**
 * Formatea múltiples métricas en una sola operación
 * Patrón usado +25 veces: formatNumberToString(value1, 1), formatNumberToString(value2, 2), etc.
 */
export const formatMetricsBatch = (
  metrics: Record<string, number>,
  decimals: Record<string, number> = {}
): Record<string, string> => {
  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(metrics)) {
    const decimal = decimals[key] || 2;
    result[key] = formatNumberToString(value, decimal);
  }

  return result;
};

/**
 * Formatea métricas con unidades específicas
 * Para casos donde se necesitan unidades diferentes
 */
export const formatMetricsWithUnits = (
  metrics: {
    weights?: number[];
    percentages?: number[];
    volumes?: number[];
    scores?: number[];
  },
  units: {
    weights?: string;
    percentages?: string;
    volumes?: string;
    scores?: string;
  } = {}
): {
  weights: string[];
  percentages: string[];
  volumes: string[];
  scores: string[];
} => {
  const defaultUnits = {
    weights: 'kg',
    percentages: '%',
    volumes: 'kg',
    scores: '%'
  };

  const finalUnits = { ...defaultUnits, ...units };

  return {
    weights: (metrics.weights || []).map(w => `${formatNumberToString(w, 1)}${finalUnits.weights}`),
    percentages: (metrics.percentages || []).map(p => `${formatNumberToString(p, 1)}${finalUnits.percentages}`),
    volumes: (metrics.volumes || []).map(v => `${formatNumberToString(v, 0)}${finalUnits.volumes}`),
    scores: (metrics.scores || []).map(s => `${formatNumberToString(s, 0)}${finalUnits.scores}`)
  };
};

/**
 * Formatea métricas de progreso con signos
 * Para casos donde se necesitan signos + o -
 */
export const formatProgressMetrics = (
  metrics: Record<string, number>,
  decimals: Record<string, number> = {}
): Record<string, string> => {
  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(metrics)) {
    const decimal = decimals[key] || 1;
    const sign = value > 0 ? '+' : '';
    result[key] = `${sign}${formatNumberToString(value, decimal)}`;
  }

  return result;
};

/**
 * Formatea métricas de comparación (antes/después)
 * Para casos donde se comparan valores
 */
export const formatComparisonMetrics = (
  before: Record<string, number>,
  after: Record<string, number>,
  decimals: Record<string, number> = {}
): Record<string, string> => {
  const result: Record<string, string> = {};

  for (const [key, beforeValue] of Object.entries(before)) {
    const afterValue = after[key] || 0;
    const decimal = decimals[key] || 1;
    const change = afterValue - beforeValue;
    const sign = change > 0 ? '+' : '';

    result[key] = `${formatNumberToString(beforeValue, decimal)} → ${formatNumberToString(afterValue, decimal)} (${sign}${formatNumberToString(change, decimal)})`;
  }

  return result;
};

/**
 * Formatea métricas de rango (min - max)
 * Para casos donde se muestran rangos
 */
export const formatRangeMetrics = (
  ranges: Record<string, { min: number; max: number }>,
  decimals: Record<string, number> = {}
): Record<string, string> => {
  const result: Record<string, string> = {};

  for (const [key, range] of Object.entries(ranges)) {
    const decimal = decimals[key] || 1;
    result[key] = `${formatNumberToString(range.min, decimal)} - ${formatNumberToString(range.max, decimal)}`;
  }

  return result;
};

/**
 * Formatea métricas con tooltips informativos
 * Para casos donde se necesitan explicaciones adicionales
 */
export const formatMetricsWithTooltips = (
  metrics: Record<string, { value: number; tooltip: string }>,
  decimals: Record<string, number> = {}
): Record<string, { display: string; tooltip: string }> => {
  const result: Record<string, { display: string; tooltip: string }> = {};

  for (const [key, { value, tooltip }] of Object.entries(metrics)) {
    const decimal = decimals[key] || 2;
    result[key] = {
      display: formatNumberToString(value, decimal),
      tooltip
    };
  }

  return result;
};