import { calculateConsistencyScore } from './calculate-consistency-score';
import { calculateIntensityScore } from './calculate-intensity-score';
import { calculateVolumeProgression } from './calculate-volume-progression';
import { calculateWeightProgression } from './calculate-weight-progression';
import { roundToDecimalsBatch } from './math-utils';
import { getLatestDate, getMaxEstimated1RM, getMaxWeight, getMinWeight, sortRecordsByDate } from './workout-utils';

import type { WorkoutRecord } from '@/interfaces';

/**
 * Calcula métricas detalladas por categoría de ejercicio
 * Optimizado con batch processing para evitar múltiples llamadas a roundToDecimals
 */
export const calculateCategoryMetrics = (
  records: WorkoutRecord[],
  targetCategory: string,
): {
  totalVolume: number;
  avgWeight: number;
  maxWeight: number;
  minWeight: number;
  avgWorkoutsPerWeek: number;
  workoutCount: number;
  percentage: number;
  avgSets: number;
  avgReps: number;
  estimatedOneRM: number;
  weightProgression: number;
  volumeProgression: number;
  intensityScore: number;
  efficiencyScore: number;
  consistencyScore: number;
} => {
  if (records.length === 0) {
    return {
      totalVolume: 0,
      avgWeight: 0,
      maxWeight: 0,
      minWeight: 0,
      avgWorkoutsPerWeek: 0,
      workoutCount: 0,
      percentage: 0,
      avgSets: 0,
      avgReps: 0,
      estimatedOneRM: 0,
      weightProgression: 0,
      volumeProgression: 0,
      intensityScore: 0,
      efficiencyScore: 0,
      consistencyScore: 0,
    };
  }

  // Filtrar registros de la categoría objetivo
  const categoryRecords = records.filter(record =>
    record.exercise?.categories?.includes(targetCategory),
  );

  if (categoryRecords.length === 0) {
    return {
      totalVolume: 0,
      avgWeight: 0,
      maxWeight: 0,
      minWeight: 0,
      avgWorkoutsPerWeek: 0,
      workoutCount: 0,
      percentage: 0,
      avgSets: 0,
      avgReps: 0,
      estimatedOneRM: 0,
      weightProgression: 0,
      volumeProgression: 0,
      intensityScore: 0,
      efficiencyScore: 0,
      consistencyScore: 0,
    };
  }

  // Obtener registros recientes para cálculos de progresión
  const sortedRecords = sortRecordsByDate(categoryRecords);

  // Calcular métricas básicas
  const categoryVolume = categoryRecords.reduce((sum, record) =>
    sum + (record.weight * record.reps * record.sets), 0,
  );

  const weights = categoryRecords.map(r => r.weight);
  const avgWeight = weights.length > 0 ? weights.reduce((sum, w) => sum + w, 0) / weights.length : 0;
  const maxWeight = getMaxWeight(categoryRecords);
  const minWeight = getMinWeight(categoryRecords);

  // Calcular métricas de frecuencia
  const workoutCount = categoryRecords.length;
  const totalDays = Math.max(1, (new Date().getTime() - new Date(getLatestDate(records).getTime()).getTime()) / (1000 * 60 * 60 * 24));
  const avgWorkoutsPerWeek = (workoutCount / totalDays) * 7;

  // Calcular porcentaje del total
  const totalVolume = records.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0);
  const percentage = totalVolume > 0 ? (categoryVolume / totalVolume) * 100 : 0;

  // Calcular métricas de series y repeticiones
  const totalSets = categoryRecords.reduce((sum, r) => sum + r.sets, 0);
  const totalReps = categoryRecords.reduce((sum, r) => sum + r.reps, 0);
  const avgSets = workoutCount > 0 ? totalSets / workoutCount : 0;
  const avgReps = workoutCount > 0 ? totalReps / workoutCount : 0;

  // Calcular 1RM estimado
  const estimatedOneRM = getMaxEstimated1RM(categoryRecords);

  // Calcular progresión de peso y volumen
  const weightProgression = calculateWeightProgression(sortedRecords, targetCategory);
  const volumeProgression = calculateVolumeProgression(sortedRecords, targetCategory);

  // Calcular scores de intensidad, eficiencia y consistencia
  const intensityScore = calculateIntensityScore(categoryRecords);
  const efficiencyScore = 75; // Valor por defecto - función no disponible
  const consistencyScore = calculateConsistencyScore(categoryRecords, avgWorkoutsPerWeek);

  // ✅ OPTIMIZACIÓN: Usar batch processing para redondeo
  const roundedMetrics = roundToDecimalsBatch({
    totalVolume: categoryVolume,
    avgWeight,
    maxWeight,
    minWeight,
    avgWorkoutsPerWeek,
    percentage,
    avgSets,
    avgReps,
    estimatedOneRM,
    weightProgression,
    volumeProgression,
    intensityScore,
    efficiencyScore,
    consistencyScore,
  }, {
    // Especificar decimales específicos para cada métrica
    totalVolume: 0,
    avgWeight: 2,
    maxWeight: 1,
    minWeight: 1,
    avgWorkoutsPerWeek: 2,
    percentage: 1,
    avgSets: 2,
    avgReps: 2,
    estimatedOneRM: 1,
    weightProgression: 1,
    volumeProgression: 1,
    intensityScore: 0,
    efficiencyScore: 0,
    consistencyScore: 0,
  });

  return {
    totalVolume: roundedMetrics.totalVolume,
    avgWeight: roundedMetrics.avgWeight,
    maxWeight: roundedMetrics.maxWeight,
    minWeight: roundedMetrics.minWeight,
    avgWorkoutsPerWeek: roundedMetrics.avgWorkoutsPerWeek,
    workoutCount,
    percentage: roundedMetrics.percentage,
    avgSets: roundedMetrics.avgSets,
    avgReps: roundedMetrics.avgReps,
    estimatedOneRM: roundedMetrics.estimatedOneRM,
    weightProgression: roundedMetrics.weightProgression,
    volumeProgression: roundedMetrics.volumeProgression,
    intensityScore: roundedMetrics.intensityScore,
    efficiencyScore: roundedMetrics.efficiencyScore,
    consistencyScore: roundedMetrics.consistencyScore,
  };
};
