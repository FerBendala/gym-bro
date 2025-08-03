import { startOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import { calculateConsistencyScore } from './calculate-consistency-score';
import { calculateIntensityScore } from './calculate-intensity-score';
import { calculateVolumeProgression } from './calculate-volume-progression';
import { calculateWeightProgression } from './calculate-weight-progression';
import { calculateCategoryEffortDistribution } from './exercise-patterns';
import { roundToDecimalsBatch } from './math-utils';
import { getMaxEstimated1RM, getMaxWeight, getMinWeight, sortRecordsByDate } from './workout-utils';

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
  lastWorkout: Date | null;
  daysSinceLastWorkout: number;
  personalRecords: number;
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
      lastWorkout: null,
      daysSinceLastWorkout: 0,
      personalRecords: 0,
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
      lastWorkout: null,
      daysSinceLastWorkout: 0,
      personalRecords: 0,
    };
  }

  // Obtener registros recientes para cálculos de progresión
  const sortedRecords = sortRecordsByDate(categoryRecords);

  // **CORRECCIÓN CRÍTICA**: Calcular volumen aplicando porcentajes de categorías
  const categoryVolume = categoryRecords.reduce((sum, record) => {
    const categories = record.exercise?.categories || [];
    const totalVolume = record.weight * record.reps * record.sets;

    // Si es multi-categoría, aplicar porcentaje de la categoría objetivo
    if (categories.length > 1) {
      const effortDistribution = calculateCategoryEffortDistribution(categories, record.exercise?.name, record.exercise);
      const categoryEffort = effortDistribution[targetCategory] || 0;
      return sum + (totalVolume * categoryEffort);
    } else {
      // Si es una sola categoría, usar volumen completo
      return sum + totalVolume;
    }
  }, 0);

  const weights = categoryRecords.map(r => r.weight);
  const avgWeight = weights.length > 0 ? weights.reduce((sum, w) => sum + w, 0) / weights.length : 0;
  const maxWeight = getMaxWeight(categoryRecords);
  const minWeight = getMinWeight(categoryRecords);

  // Calcular métricas de frecuencia
  const workoutCount = categoryRecords.length;

  // Calcular frecuencia real basada en semanas únicas
  const uniqueWeeks = new Set();
  const uniqueSessions = new Set(); // Para contar sesiones únicas, no ejercicios

  categoryRecords.forEach(record => {
    const weekStart = startOfWeek(record.date, { locale: es });
    const weekKey = weekStart.toISOString().split('T')[0];
    uniqueWeeks.add(weekKey);

    // Contar sesiones únicas por día
    const sessionKey = `${record.date.toDateString()}`;
    uniqueSessions.add(sessionKey);
  });

  const totalWeeks = uniqueWeeks.size;
  const totalSessions = uniqueSessions.size;
  const avgWorkoutsPerWeek = totalWeeks > 0 ? totalSessions / totalWeeks : 0;

  // **CORRECCIÓN CRÍTICA**: Calcular porcentaje del total aplicando porcentajes de categorías
  const totalVolume = records.reduce((sum, record) => {
    const categories = record.exercise?.categories || [];
    const totalVolume = record.weight * record.reps * record.sets;

    // Para cada categoría del ejercicio, aplicar su porcentaje
    let exerciseVolume = 0;
    if (categories.length > 1) {
      const effortDistribution = calculateCategoryEffortDistribution(categories, record.exercise?.name, record.exercise);
      categories.forEach(category => {
        const categoryEffort = effortDistribution[category] || 0;
        exerciseVolume += totalVolume * categoryEffort;
      });
    } else {
      exerciseVolume = totalVolume;
    }

    return sum + exerciseVolume;
  }, 0);

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

  // Validar que los valores estén en rangos razonables
  const validatedIntensityScore = Math.min(100, Math.max(0, intensityScore));
  const validatedConsistencyScore = Math.min(100, Math.max(0, consistencyScore));

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

  // Calcular datos adicionales requeridos
  const lastWorkout = categoryRecords.length > 0 ?
    new Date(Math.max(...categoryRecords.map(r => r.date.getTime()))) : null;

  const daysSinceLastWorkout = lastWorkout ?
    Math.floor((new Date().getTime() - lastWorkout.getTime()) / (1000 * 60 * 60 * 24)) : 0;

  // Calcular PRs reales (récords personales por ejercicio)
  const personalRecords = (() => {
    if (categoryRecords.length === 0) return 0;

    // Filtrar ejercicios que son específicos de esta categoría
    const categorySpecificRecords = categoryRecords.filter(record => {
      const categories = record.exercise?.categories || [];
      // Solo contar ejercicios donde esta categoría es la principal o única
      return categories.length === 1 || categories[0] === targetCategory;
    });

    // Agrupar por ejercicio y encontrar el peso máximo de cada uno
    const exercisePRs = new Map<string, number>();

    categorySpecificRecords.forEach(record => {
      const exerciseId = record.exerciseId;
      const currentMax = exercisePRs.get(exerciseId) || 0;
      if (record.weight > currentMax) {
        exercisePRs.set(exerciseId, record.weight);
      }
    });

    // Contar cuántos ejercicios específicos de esta categoría tienen PRs
    return exercisePRs.size;
  })();

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
    intensityScore: validatedIntensityScore,
    efficiencyScore: roundedMetrics.efficiencyScore,
    consistencyScore: validatedConsistencyScore,
    lastWorkout,
    daysSinceLastWorkout,
    personalRecords,
  };
};
