import { analyzeMuscleBalance } from './analyze-muscle-balance';
import { calculateCategoryMetrics } from './calculate-category-metrics';
import type { CategoryAnalysis, CategoryMetrics, MuscleBalance } from './category-analysis-types';

import { EXERCISE_CATEGORIES } from '@/constants';
import type { WorkoutRecord } from '@/interfaces';

/**
 * Calcula el score de balance general entre todas las categorías
 */
export const calculateBalanceScore = (muscleBalance: MuscleBalance[]): number => {
  if (muscleBalance.length === 0) return 0;

  // Calcular score basado en desviaciones del ideal
  const totalDeviation = muscleBalance.reduce((sum, balance) => {
    const deviation = Math.abs(balance.deviation);
    return sum + deviation;
  }, 0);

  const averageDeviation = totalDeviation / muscleBalance.length;

  // Convertir a score de 0-100 (menor desviación = mayor score)
  const maxDeviation = 50; // Desviación máxima considerada
  const score = Math.max(0, 100 - (averageDeviation / maxDeviation) * 100);

  return Math.round(score);
};

/**
 * Encuentra la categoría dominante (con mayor volumen)
 */
const findDominantCategory = (records: WorkoutRecord[]): string | null => {
  if (records.length === 0) return null;

  const categoryVolumes = EXERCISE_CATEGORIES.map(category => {
    const metrics = calculateCategoryMetrics(records, category);
    return { category, volume: metrics.totalVolume };
  });

  const sorted = categoryVolumes.sort((a, b) => b.volume - a.volume);
  return sorted[0]?.category || null;
};

/**
 * Encuentra la categoría menos entrenada (con al menos 1 entrenamiento)
 */
const findLeastTrainedCategory = (records: WorkoutRecord[]): string | null => {
  if (records.length === 0) return null;

  const categoryMetrics = EXERCISE_CATEGORIES.map(category => {
    const metrics = calculateCategoryMetrics(records, category);
    return { category, percentage: metrics.percentage, workoutCount: metrics.workoutCount };
  });

  const sorted = categoryMetrics
    .filter(metric => metric.workoutCount > 0)
    .sort((a, b) => a.percentage - b.percentage);

  return sorted[0]?.category || null;
};

/**
 * Calcula el análisis completo por categorías
 */
export const calculateCategoryAnalysis = (records: WorkoutRecord[]): CategoryAnalysis => {
  const muscleBalance = analyzeMuscleBalance(records);
  const balanceScore = calculateBalanceScore(muscleBalance);
  const dominantCategory = findDominantCategory(records);
  const leastTrainedCategory = findLeastTrainedCategory(records);

  // Crear array de métricas por categoría para compatibilidad
  const categoryMetrics: CategoryMetrics[] = EXERCISE_CATEGORIES.map(category => {
    const metrics = calculateCategoryMetrics(records, category);
    return {
      category,
      totalVolume: metrics.totalVolume,
      percentage: metrics.percentage,
      workouts: metrics.workoutCount,
      avgWeight: metrics.avgWeight,
      maxWeight: metrics.maxWeight,
      minWeight: metrics.minWeight,
      avgWorkoutsPerWeek: metrics.avgWorkoutsPerWeek,
      avgSets: metrics.avgSets,
      avgReps: metrics.avgReps,
      estimatedOneRM: metrics.estimatedOneRM,
      weightProgression: metrics.weightProgression,
      volumeProgression: metrics.volumeProgression,
      intensityScore: metrics.intensityScore,
      efficiencyScore: metrics.efficiencyScore,
      consistencyScore: metrics.consistencyScore,
      // Propiedades adicionales requeridas
      lastWorkout: null, // TODO: Implementar
      totalSets: metrics.avgSets * metrics.workoutCount,
      totalReps: metrics.avgReps * metrics.workoutCount,
      personalRecords: 0, // TODO: Implementar
      daysSinceLastWorkout: 0, // TODO: Implementar
      trend: metrics.weightProgression > 0 ? 'improving' : 'stable',
      strengthLevel: metrics.estimatedOneRM > 100 ? 'advanced' : metrics.estimatedOneRM > 50 ? 'intermediate' : 'beginner',
      recentImprovement: metrics.weightProgression > 0,
      volumeDistribution: {
        thisWeek: 0,
        lastWeek: 0,
        thisMonth: 0,
        lastMonth: 0,
      },
      performanceMetrics: {
        bestSession: {
          date: new Date(),
          volume: metrics.totalVolume,
          maxWeight: metrics.maxWeight,
        },
        averageSessionVolume: metrics.totalVolume / Math.max(1, metrics.workoutCount),
        volumePerWorkout: metrics.totalVolume / Math.max(1, metrics.workoutCount),
        sessionsAboveAverage: 0,
      },
      recommendations: [],
      warnings: [],
    };
  });

  return {
    categoryMetrics,
    muscleBalance,
    dominantCategory,
    leastTrainedCategory,
    balanceScore,
  };
};
