/**
 * Utilidades matemáticas centralizadas
 * Patrón usado +15 veces: Math.max(min, Math.min(max, value))
 */

/**
 * Redondea un número a un número específico de decimales
 * Patrón usado +50 veces en todo el código base
 */
export const roundToDecimals = (value: number, decimals = 2): number => {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
};

/**
 * Limita un valor entre un mínimo y máximo
 * Patrón usado +15 veces: Math.max(min, Math.min(max, value))
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};

/**
 * ✅ NUEVA FUNCIÓN: Procesamiento batch de redondeo
 * Optimiza múltiples llamadas a roundToDecimals
 * Patrón usado +50 veces: roundToDecimals(value1), roundToDecimals(value2), etc.
 */
export const roundToDecimalsBatch = (
  values: Record<string, number>,
  decimals: Record<string, number> = {},
): Record<string, number> => {
  const result: Record<string, number> = {};

  for (const [key, value] of Object.entries(values)) {
    const decimal = decimals[key] || 2;
    result[key] = roundToDecimals(value, decimal);
  }

  return result;
};

/**
 * ✅ NUEVA FUNCIÓN: Procesamiento batch con decimales específicos
 * Para casos donde se necesitan diferentes decimales por tipo de valor
 */
export const roundMetricsBatch = (metrics: {
  weights?: number[];
  percentages?: number[];
  volumes?: number[];
  scores?: number[];
}): {
  weights: number[];
  percentages: number[];
  volumes: number[];
  scores: number[];
} => {
  return {
    weights: (metrics.weights || []).map(w => roundToDecimals(w, 1)),
    percentages: (metrics.percentages || []).map(p => roundToDecimals(p, 1)),
    volumes: (metrics.volumes || []).map(v => roundToDecimals(v, 0)),
    scores: (metrics.scores || []).map(s => roundToDecimals(s, 0)),
  };
};

/**
 * ✅ NUEVA FUNCIÓN: Validación y redondeo en una operación
 * Combina clamp + roundToDecimals para optimizar validaciones
 */
export const validateAndRound = (
  value: number,
  min: number,
  max: number,
  decimals = 2,
): number => {
  return roundToDecimals(clamp(value, min, max), decimals);
};

/**
 * ✅ NUEVA FUNCIÓN: Procesamiento batch de validación y redondeo
 * Para múltiples valores que necesitan validación y redondeo
 */
export const validateAndRoundBatch = (
  values: Record<string, { value: number; min: number; max: number; decimals?: number }>,
): Record<string, number> => {
  const result: Record<string, number> = {};

  for (const [key, config] of Object.entries(values)) {
    result[key] = validateAndRound(
      config.value,
      config.min,
      config.max,
      config.decimals || 2,
    );
  }

  return result;
};
