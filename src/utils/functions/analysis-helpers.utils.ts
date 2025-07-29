import { sortRecordsByDateAscending } from './workout-utils';

import type { WorkoutRecord } from '@/interfaces';

/**
 * Utilidades de análisis centralizadas
 * Optimizado para usar funciones de ordenamiento centralizadas
 */

/**
 * Calcula la tendencia de peso en un período específico
 */
export const calculateWeightTrend = (records: WorkoutRecord[], days = 30): number => {
  if (records.length < 2) return 0;

  // ✅ OPTIMIZACIÓN: Usar función centralizada de ordenamiento
  const sortedRecords = sortRecordsByDateAscending(records);

  const recentRecords = sortedRecords.slice(-Math.min(days, sortedRecords.length));
  const olderRecords = sortedRecords.slice(0, Math.max(0, sortedRecords.length - days));

  if (recentRecords.length === 0 || olderRecords.length === 0) return 0;

  const recentAvgWeight = recentRecords.reduce((sum, r) => sum + r.weight, 0) / recentRecords.length;
  const olderAvgWeight = olderRecords.reduce((sum, r) => sum + r.weight, 0) / olderRecords.length;

  return recentAvgWeight - olderAvgWeight;
};

/**
 * Calcula la tendencia de volumen en un período específico
 */
export const calculateVolumeTrend = (records: WorkoutRecord[], days = 30): number => {
  if (records.length < 2) return 0;

  // ✅ OPTIMIZACIÓN: Usar función centralizada de ordenamiento
  const sortedRecords = sortRecordsByDateAscending(records);

  const recentRecords = sortedRecords.slice(-Math.min(days, sortedRecords.length));
  const olderRecords = sortedRecords.slice(0, Math.max(0, sortedRecords.length - days));

  if (recentRecords.length === 0 || olderRecords.length === 0) return 0;

  const recentAvgVolume = recentRecords.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0) / recentRecords.length;
  const olderAvgVolume = olderRecords.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0) / olderRecords.length;

  return recentAvgVolume - olderAvgVolume;
};

/**
 * Calcula la frecuencia de entrenamiento en un período específico
 */
export const calculateTrainingFrequency = (records: WorkoutRecord[], days = 30): number => {
  if (records.length === 0) return 0;

  // ✅ OPTIMIZACIÓN: Usar función centralizada de ordenamiento
  const sortedRecords = sortRecordsByDateAscending(records);

  const recentRecords = sortedRecords.slice(-Math.min(days, sortedRecords.length));
  const uniqueDays = new Set(recentRecords.map(r => r.date.toDateString())).size;

  return (uniqueDays / days) * 7; // Frecuencia semanal
};

/**
 * Calcula la consistencia de entrenamiento
 */
export const calculateTrainingConsistency = (records: WorkoutRecord[], days = 30): number => {
  if (records.length === 0) return 0;

  // ✅ OPTIMIZACIÓN: Usar función centralizada de ordenamiento
  const sortedRecords = sortRecordsByDateAscending(records);

  const recentRecords = sortedRecords.slice(-Math.min(days, sortedRecords.length));
  const uniqueDays = new Set(recentRecords.map(r => r.date.toDateString())).size;

  // Calcular consistencia basada en días de entrenamiento vs días totales
  const consistency = (uniqueDays / days) * 100;

  // Penalizar por gaps largos
  const gaps = calculateTrainingGaps(recentRecords);
  const gapPenalty = Math.min(20, gaps * 2); // Máximo 20% de penalización

  return Math.max(0, consistency - gapPenalty);
};

/**
 * Calcula los gaps de entrenamiento
 */
const calculateTrainingGaps = (records: WorkoutRecord[]): number => {
  if (records.length < 2) return 0;

  // ✅ OPTIMIZACIÓN: Usar función centralizada de ordenamiento
  const sortedRecords = sortRecordsByDateAscending(records);

  let totalGaps = 0;
  let gapCount = 0;

  for (let i = 1; i < sortedRecords.length; i++) {
    const daysDiff = (new Date(sortedRecords[i].date).getTime() - new Date(sortedRecords[i - 1].date).getTime()) / (1000 * 60 * 60 * 24);

    if (daysDiff > 3) { // Gap de más de 3 días
      totalGaps += daysDiff;
      gapCount++;
    }
  }

  return gapCount > 0 ? totalGaps / gapCount : 0;
};

/**
 * Calcula la progresión de intensidad
 */
export const calculateIntensityProgression = (records: WorkoutRecord[], days = 30): number => {
  if (records.length < 2) return 0;

  // ✅ OPTIMIZACIÓN: Usar función centralizada de ordenamiento
  const sortedRecords = sortRecordsByDateAscending(records);

  const recentRecords = sortedRecords.slice(-Math.min(days, sortedRecords.length));
  const olderRecords = sortedRecords.slice(0, Math.max(0, sortedRecords.length - days));

  if (recentRecords.length === 0 || olderRecords.length === 0) return 0;

  const recentAvgIntensity = recentRecords.reduce((sum, r) => sum + (r.weight / r.reps), 0) / recentRecords.length;
  const olderAvgIntensity = olderRecords.reduce((sum, r) => sum + (r.weight / r.reps), 0) / olderRecords.length;

  return recentAvgIntensity - olderAvgIntensity;
};
