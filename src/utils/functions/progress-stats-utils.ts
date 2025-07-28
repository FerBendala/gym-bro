import type { WorkoutRecord } from '@/interfaces';
import { calculateEstimated1RMStats } from './strength-stats-utils';

/**
 * Calcula el crecimiento total basado en datos de timeline
 */
export const calculateTotalGrowth = (timelineData: Array<{ value: number; totalWorkouts: number }>): {
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
    absoluteGrowth: Math.round(absoluteGrowth * 100) / 100,
    percentGrowth: Math.round(percentGrowth * 100) / 100
  };
};

import { calculateRealVolume } from './volume-calculations';

/**
 * Calcula el progreso de un ejercicio específico
 */
export const calculateExerciseProgress = (exerciseRecords: WorkoutRecord[]): {
  absoluteProgress: number;
  percentProgress: number;
  first1RM: number;
  last1RM: number;
} => {
  if (exerciseRecords.length === 0) {
    return { absoluteProgress: 0, percentProgress: 0, first1RM: 0, last1RM: 0 };
  }

  const sortedRecords = [...exerciseRecords].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let first1RM: number;
  let last1RM: number;
  let firstVolume: number;
  let lastVolume: number;

  if (sortedRecords.length === 1) {
    // Para una sola sesión, usar el valor como referencia
    const record = sortedRecords[0];
    first1RM = calculateEstimated1RMStats(record.weight, record.reps);
    last1RM = first1RM;
    firstVolume = calculateRealVolume(record);
    lastVolume = firstVolume;
  } else if (sortedRecords.length === 2) {
    // Para dos sesiones, comparar directamente
    const firstRecord = sortedRecords[0];
    const lastRecord = sortedRecords[1];

    first1RM = calculateEstimated1RMStats(firstRecord.weight, firstRecord.reps);
    last1RM = calculateEstimated1RMStats(lastRecord.weight, lastRecord.reps);
    firstVolume = calculateRealVolume(firstRecord);
    lastVolume = calculateRealVolume(lastRecord);
  } else {
    // Para 3+ sesiones, usar lógica de períodos
    const firstPeriodSize = Math.min(3, Math.floor(sortedRecords.length / 3));
    const lastPeriodSize = Math.min(3, Math.floor(sortedRecords.length / 3));

    // Asegurar que los períodos tengan al menos 1 elemento
    const actualFirstPeriodSize = Math.max(1, firstPeriodSize);
    const actualLastPeriodSize = Math.max(1, lastPeriodSize);

    const firstPeriod = sortedRecords.slice(0, actualFirstPeriodSize);
    const lastPeriod = sortedRecords.slice(-actualLastPeriodSize);

    first1RM = firstPeriod.reduce((sum, r) => {
      const oneRM = r.weight * (1 + Math.min(r.reps, 20) / 30);
      return sum + oneRM;
    }, 0) / firstPeriod.length;

    last1RM = lastPeriod.reduce((sum, r) => {
      const oneRM = r.weight * (1 + Math.min(r.reps, 20) / 30);
      return sum + oneRM;
    }, 0) / lastPeriod.length;

    // Calcular volumen total promedio por sesión usando volumen real
    firstVolume = firstPeriod.reduce((sum, r) => {
      return sum + calculateRealVolume(r);
    }, 0) / firstPeriod.length;

    lastVolume = lastPeriod.reduce((sum, r) => {
      return sum + calculateRealVolume(r);
    }, 0) / lastPeriod.length;
  }

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

  // Limitar progreso a un rango razonable (-80% a +300% para ejercicios individuales)
  const percentProgress = Math.max(-80, Math.min(300, rawPercentProgress));

  return { absoluteProgress, percentProgress, first1RM, last1RM };
};

/**
 * Calcula el progreso de peso general usando múltiples períodos para mayor robustez
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

  // Calcular 1RM promedio para cada período
  const firstAvg1RM = firstPeriod.reduce((sum, r) => {
    const oneRM = r.weight * (1 + Math.min(r.reps, 20) / 30);
    return sum + oneRM;
  }, 0) / firstPeriod.length;

  const lastAvg1RM = lastPeriod.reduce((sum, r) => {
    const oneRM = r.weight * (1 + Math.min(r.reps, 20) / 30);
    return sum + oneRM;
  }, 0) / lastPeriod.length;

  const absoluteProgress = lastAvg1RM - firstAvg1RM;

  // Calcular porcentaje con validación
  if (firstAvg1RM <= 0) {
    return { absoluteProgress, percentProgress: 0, firstAvg1RM, lastAvg1RM };
  }

  const rawPercentProgress = (absoluteProgress / firstAvg1RM) * 100;

  // Limitar progreso a un rango razonable (-70% a +150% para progreso general)
  const percentProgress = Math.max(-70, Math.min(150, rawPercentProgress));

  return { absoluteProgress, percentProgress, firstAvg1RM, lastAvg1RM };
};