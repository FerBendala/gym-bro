import type { ExerciseAssignment, WorkoutRecord } from '@/interfaces';
import { analyzeMuscleBalance } from './analyze-muscle-balance';
import { calculateCategoryMetrics } from './calculate-category-metrics';
import type { CategoryAnalysis, CategoryMetrics, MuscleBalance } from './category-analysis-types';

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
const findDominantCategory = (categoryMetrics: CategoryMetrics[]): string | null => {
  if (categoryMetrics.length === 0) return null;

  const sorted = [...categoryMetrics].sort((a, b) => b.totalVolume - a.totalVolume);
  return sorted[0]?.category || null;
};

/**
 * Encuentra la categoría menos entrenada (con al menos 1 entrenamiento)
 */
const findLeastTrainedCategory = (categoryMetrics: CategoryMetrics[]): string | null => {
  if (categoryMetrics.length === 0) return null;

  const sorted = [...categoryMetrics]
    .filter(metric => metric.workouts > 0)
    .sort((a, b) => a.percentage - b.percentage);

  return sorted[0]?.category || null;
};

/**
 * Calcula el análisis completo por categorías
 */
export const calculateCategoryAnalysis = (records: WorkoutRecord[], allAssignments?: ExerciseAssignment[]): CategoryAnalysis => {
  const categoryMetrics = calculateCategoryMetrics(records, allAssignments);
  const muscleBalance = analyzeMuscleBalance(records, allAssignments);
  const balanceScore = calculateBalanceScore(muscleBalance);
  const dominantCategory = findDominantCategory(categoryMetrics);
  const leastTrainedCategory = findLeastTrainedCategory(categoryMetrics);

  return {
    categoryMetrics,
    muscleBalance,
    dominantCategory,
    leastTrainedCategory,
    balanceScore
  };
};