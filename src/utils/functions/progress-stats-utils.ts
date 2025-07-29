import { calculateOptimal1RM } from './calculate-1rm.utils';
import { clamp, roundToDecimals } from './math-utils';
import { calculateVolume } from './volume-calculations';

import type { WorkoutRecord } from '@/interfaces';

/**
 * Calcula el crecimiento total basado en datos de timeline
 * Refactorizado para usar funciones centralizadas
 */
export const calculateTotalGrowth = (timelineData: { value: number; totalWorkouts: number }[]): {
  absoluteGrowth: number;
  percentGrowth: number;
} => {
  if (timelineData.length < 2) {
    return { absoluteGrowth: 0, percentGrowth: 0 };
  }

  const firstValue = timelineData[0].value;
  const lastValue = timelineData[timelineData.length - 1].value;

  const absoluteGrowth = lastValue - firstValue;
  const percentGrowth = firstValue > 0 ? (absoluteGrowth / firstValue) * 100 : 0;

  return {
    absoluteGrowth: roundToDecimals(absoluteGrowth * 100) / 100,
    percentGrowth: roundToDecimals(percentGrowth * 100) / 100,
  };
};

/**
 * Calcula el progreso de un ejercicio específico
 * Refactorizado para usar funciones centralizadas
 */
export const calculateExerciseProgress = (exerciseRecords: WorkoutRecord[]): {
  absoluteProgress: number;
  percentProgress: number;
  first1RM: number;
  last1RM: number;
} => {
  if (exerciseRecords.length < 3) {
    return { absoluteProgress: 0, percentProgress: 0, first1RM: 0, last1RM: 0 };
  }

  const sortedRecords = [...exerciseRecords].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Para pocos registros (≤5), usar primer y último
  if (sortedRecords.length <= 5) {
    const firstRecord = sortedRecords[0];
    const lastRecord = sortedRecords[sortedRecords.length - 1];

    // Usar función centralizada para calcular 1RM
    const first1RM = calculateOptimal1RM(firstRecord.weight, firstRecord.reps);
    const last1RM = calculateOptimal1RM(lastRecord.weight, lastRecord.reps);

    const absoluteProgress = last1RM - first1RM;
    const percentProgress = first1RM > 0 ? (absoluteProgress / first1RM) * 100 : 0;

    return {
      absoluteProgress: roundToDecimals(absoluteProgress),
      percentProgress: roundToDecimals(percentProgress),
      first1RM: roundToDecimals(first1RM),
      last1RM: roundToDecimals(last1RM),
    };
  }

  // Para más registros, usar períodos para mayor robustez
  const firstPeriodSize = Math.min(3, Math.floor(sortedRecords.length / 3));
  const lastPeriodSize = Math.min(3, Math.floor(sortedRecords.length / 3));

  // Asegurar que los períodos tengan al menos 1 elemento
  const actualFirstPeriodSize = Math.max(1, firstPeriodSize);
  const actualLastPeriodSize = Math.max(1, lastPeriodSize);

  const firstPeriod = sortedRecords.slice(0, actualFirstPeriodSize);
  const lastPeriod = sortedRecords.slice(-actualLastPeriodSize);

  // Usar función centralizada para calcular 1RM promedio
  const first1RM = firstPeriod.reduce((sum, r) => {
    const oneRM = calculateOptimal1RM(r.weight, r.reps);
    return sum + oneRM;
  }, 0) / firstPeriod.length;

  const last1RM = lastPeriod.reduce((sum, r) => {
    const oneRM = calculateOptimal1RM(r.weight, r.reps);
    return sum + oneRM;
  }, 0) / lastPeriod.length;

  // Calcular volumen total promedio por sesión usando función centralizada
  const firstVolume = firstPeriod.reduce((sum, r) => {
    return sum + calculateVolume(r);
  }, 0) / firstPeriod.length;

  const lastVolume = lastPeriod.reduce((sum, r) => {
    return sum + calculateVolume(r);
  }, 0) / lastPeriod.length;

  let absoluteProgress = last1RM - first1RM;
  let rawPercentProgress = first1RM > 0 ? (absoluteProgress / first1RM) * 100 : 0;

  // MEJORA: Si el progreso de fuerza es mínimo pero hay mejora en volumen, considerarlo como progreso
  if (Math.abs(rawPercentProgress) < 2.5 && firstVolume > 0) {
    const volumeProgress = ((lastVolume - firstVolume) / firstVolume) * 100;

    // Para pocas sesiones (≤3), ser más sensible al cambio de volumen (>1%)
    // Para más sesiones, requerir cambio más significativo (>5%)
    const volumeThreshold = sortedRecords.length <= 3 ? 1 : 5;

    if (volumeProgress > volumeThreshold) {
      // Convertir mejora de volumen a equivalente de fuerza
      // Factor más generoso para pocas sesiones, más conservador para muchas
      const volumeToStrengthFactor = sortedRecords.length <= 3 ? 0.5 : 0.3;
      const adjustedStrengthProgress = volumeProgress * volumeToStrengthFactor;

      rawPercentProgress = Math.max(rawPercentProgress, adjustedStrengthProgress);
      absoluteProgress = (rawPercentProgress / 100) * first1RM;
    }
  }

  // Calcular porcentaje con validación
  if (first1RM <= 0) {
    return { absoluteProgress, percentProgress: 0, first1RM, last1RM };
  }

  // Usar función centralizada para validar rango
  const percentProgress = clamp(rawPercentProgress, -80, 300);

  return {
    absoluteProgress: roundToDecimals(absoluteProgress),
    percentProgress: roundToDecimals(percentProgress),
    first1RM: roundToDecimals(first1RM),
    last1RM: roundToDecimals(last1RM),
  };
};

/**
 * Calcula el progreso de peso general usando múltiples períodos para mayor robustez
 * Refactorizado para usar funciones centralizadas
 */
export const calculateWeightProgress = (records: WorkoutRecord[]): {
  absoluteProgress: number;
  percentProgress: number;
  firstAvg1RM: number;
  lastAvg1RM: number;
} => {
  if (records.length < 10) { // Necesita más datos para análisis general
    return { absoluteProgress: 0, percentProgress: 0, firstAvg1RM: 0, lastAvg1RM: 0 };
  }

  const sortedRecords = [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Para progreso general, usar períodos más grandes
  const firstPeriodSize = Math.min(10, Math.floor(sortedRecords.length / 4));
  const lastPeriodSize = Math.min(10, Math.floor(sortedRecords.length / 4));

  const firstPeriod = sortedRecords.slice(0, firstPeriodSize);
  const lastPeriod = sortedRecords.slice(-lastPeriodSize);

  // Calcular 1RM promedio para cada período usando función centralizada
  const firstAvg1RM = firstPeriod.reduce((sum, r) => {
    const oneRM = calculateOptimal1RM(r.weight, r.reps);
    return sum + oneRM;
  }, 0) / firstPeriod.length;

  const lastAvg1RM = lastPeriod.reduce((sum, r) => {
    const oneRM = calculateOptimal1RM(r.weight, r.reps);
    return sum + oneRM;
  }, 0) / lastPeriod.length;

  const absoluteProgress = lastAvg1RM - firstAvg1RM;

  // Calcular porcentaje con validación
  if (firstAvg1RM <= 0) {
    return { absoluteProgress, percentProgress: 0, firstAvg1RM, lastAvg1RM };
  }

  const rawPercentProgress = (absoluteProgress / firstAvg1RM) * 100;

  // Usar función centralizada para validar rango
  const percentProgress = clamp(rawPercentProgress, -70, 150);

  return {
    absoluteProgress: roundToDecimals(absoluteProgress),
    percentProgress: roundToDecimals(percentProgress),
    firstAvg1RM: roundToDecimals(firstAvg1RM),
    lastAvg1RM: roundToDecimals(lastAvg1RM),
  };
};
