import type { CategoryAnalysis, MuscleBalanceItem, UpperLowerBalanceData } from '../types';

/**
 * Valida que los datos de balance superior/inferior sean consistentes
 */
export const validateUpperLowerBalanceData = (data: UpperLowerBalanceData): boolean => {
  if (!data) return false;

  const { upperBody, lowerBody, core } = data;

  // Validar estructura básica
  if (!upperBody || !lowerBody || !core) return false;

  // Validar tipos de datos
  const isValidNumber = (value: unknown): boolean =>
    typeof value === 'number' && !isNaN(value) && isFinite(value);

  const isValidArray = (value: unknown): boolean =>
    Array.isArray(value) && value.every(item => typeof item === 'string');

  return (
    isValidNumber(upperBody.percentage) &&
    isValidNumber(upperBody.volume) &&
    isValidArray(upperBody.categories) &&
    isValidNumber(lowerBody.percentage) &&
    isValidNumber(lowerBody.volume) &&
    isValidArray(lowerBody.categories) &&
    isValidNumber(core.percentage) &&
    isValidNumber(core.volume) &&
    isValidArray(core.categories)
  );
};

/**
 * Valida que los datos de análisis de categorías sean consistentes
 */
export const validateCategoryAnalysisData = (data: CategoryAnalysis): boolean => {
  if (!data) return false;

  if (!Array.isArray(data.categoryMetrics)) return false;

  return data.categoryMetrics.every(metric =>
    metric &&
    typeof metric.category === 'string' &&
    typeof metric.percentage === 'number' &&
    // Nota: totalVolume puede no estar presente en todos los tipos de CategoryMetric
    (!('totalVolume' in metric) || (typeof metric.totalVolume === 'number' && !isNaN(metric.totalVolume))),
  );
};

/**
 * Valida que los datos de balance muscular sean consistentes
 */
export const validateMuscleBalanceData = (data: MuscleBalanceItem[]): boolean => {
  if (!Array.isArray(data)) return false;

  return data.every(item =>
    item &&
    typeof item.category === 'string' &&
    (!item.balanceHistory || (
      item.balanceHistory &&
      typeof item.balanceHistory.trend === 'string' &&
      ['improving', 'stable', 'declining'].includes(item.balanceHistory.trend)
    )),
  );
};

/**
 * Normaliza porcentajes para asegurar que estén en el rango 0-100
 */
export const normalizePercentage = (value: number): number => {
  return Math.max(0, Math.min(100, value));
};

/**
 * Normaliza volúmenes para asegurar que sean positivos
 */
export const normalizeVolume = (value: number): number => {
  return Math.max(0, value);
};

/**
 * Calcula el total de porcentajes para validar que sumen aproximadamente 100%
 */
export const calculateTotalPercentage = (data: UpperLowerBalanceData): number => {
  if (!validateUpperLowerBalanceData(data)) return 0;

  return (
    normalizePercentage(data.upperBody.percentage) +
    normalizePercentage(data.lowerBody.percentage) +
    normalizePercentage(data.core.percentage)
  );
};

/**
 * Valida que los porcentajes sumen aproximadamente 100% (con tolerancia)
 */
export const validatePercentageSum = (data: UpperLowerBalanceData, tolerance = 5): boolean => {
  const total = calculateTotalPercentage(data);
  return Math.abs(total - 100) <= tolerance;
};

/**
 * Valida la consistencia de volúmenes entre categorías
 */
export const validateVolumeConsistency = (data: UpperLowerBalanceData): boolean => {
  if (!validateUpperLowerBalanceData(data)) return false;

  const { upperBody, lowerBody, core } = data;

  // Verificar que no todos los volúmenes sean idénticos (indicaría error)
  const volumes = [upperBody.volume, lowerBody.volume, core.volume];
  const uniqueVolumes = new Set(volumes);

  // Si todos los volúmenes son idénticos y no son 0, es sospechoso
  if (uniqueVolumes.size === 1 && volumes[0] !== 0) {
    return false;
  }

  // Verificar que los volúmenes sean razonables
  const maxReasonableVolume = 200000; // 200 toneladas como límite (más realista)
  const minReasonableVolume = 100; // 100 kg como mínimo (para detectar errores de cálculo)

  // Verificar volúmenes individuales
  if (volumes.some(v => v > maxReasonableVolume)) {
    return false;
  }

  if (volumes.some(v => v < minReasonableVolume && v !== 0)) {
    return false;
  }

  // Verificar que el volumen total sea razonable
  const totalVolume = volumes.reduce((sum, v) => sum + v, 0);
  const maxTotalVolume = 500000; // 500 toneladas como límite total
  const minTotalVolume = 1000; // 1 tonelada como mínimo total

  if (totalVolume > maxTotalVolume) {
    return false;
  }

  if (totalVolume < minTotalVolume) {
    return false;
  }

  // Verificar que los volúmenes sean consistentes con los porcentajes
  const expectedUpperVolume = (upperBody.percentage / 100) * totalVolume;
  const expectedLowerVolume = (lowerBody.percentage / 100) * totalVolume;
  const expectedCoreVolume = (core.percentage / 100) * totalVolume;

  const tolerance = 0.1; // 10% de tolerancia
  const upperDeviation = Math.abs(upperBody.volume - expectedUpperVolume) / expectedUpperVolume;
  const lowerDeviation = Math.abs(lowerBody.volume - expectedLowerVolume) / expectedLowerVolume;
  const coreDeviation = Math.abs(core.volume - expectedCoreVolume) / expectedCoreVolume;

  if (upperDeviation > tolerance || lowerDeviation > tolerance || coreDeviation > tolerance) {
    return false;
  }

  return true;
};

/**
 * Genera un reporte de validación para debugging
 */
export const generateValidationReport = (
  upperLowerBalance: UpperLowerBalanceData,
  categoryAnalysis: CategoryAnalysis,
  muscleBalance: MuscleBalanceItem[],
): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validar datos de balance superior/inferior
  if (!validateUpperLowerBalanceData(upperLowerBalance)) {
    errors.push('Datos de balance superior/inferior inválidos');
  } else {
    if (!validatePercentageSum(upperLowerBalance)) {
      warnings.push('Los porcentajes no suman 100% (puede ser normal si hay Core)');
    }

    if (!validateVolumeConsistency(upperLowerBalance)) {
      errors.push('Inconsistencia en volúmenes detectada');
    }
  }

  // Validar análisis de categorías
  if (!validateCategoryAnalysisData(categoryAnalysis)) {
    errors.push('Datos de análisis de categorías inválidos');
  }

  // Validar balance muscular
  if (!validateMuscleBalanceData(muscleBalance)) {
    errors.push('Datos de balance muscular inválidos');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};
