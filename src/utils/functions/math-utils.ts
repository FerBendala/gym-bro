/**
 * Redondea un número a 2 decimales
 * Patrón usado +10 veces: Math.round(x * 100) / 100
 */
export const roundToDecimals = (value: number, decimals: number = 2): number => {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
};

/**
 * Clamp: Limita un valor entre un mínimo y máximo
 * Patrón usado +15 veces: Math.max(min, Math.min(max, value))
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
}; 