import type { WorkoutRecord } from '@/interfaces';
import { calculateRegularityScore } from './calculate-regularity-score';
import { getOptimalFrequency } from './get-optimal-frequency';

/**
 * Calcula la consistencia de entrenamiento para una categoría
 * Mejorado: separa frecuencia de regularidad y penaliza menos los patrones sistemáticos
 */
export const calculateTrainingConsistency = (categoryRecords: WorkoutRecord[], avgWorkoutsPerWeek: number): {
  frequencyScore: number;
  regularityScore: number;
  overallScore: number;
} => {
  if (categoryRecords.length === 0) {
    return { frequencyScore: 0, regularityScore: 0, overallScore: 0 };
  }

  // 1. Score de frecuencia (basado en frecuencia óptima por categoría)
  const optimalFrequency = getOptimalFrequency(categoryRecords[0]?.exercise?.categories?.[0] || '');
  const frequencyScore = Math.min(100, (avgWorkoutsPerWeek / optimalFrequency) * 100);

  // 2. Score de regularidad (mejorado para no penalizar patrones sistemáticos)
  const regularityScore = calculateRegularityScore(categoryRecords);

  // 3. Score general (ponderado)
  const overallScore = Math.round((frequencyScore * 0.6) + (regularityScore * 0.4));

  return {
    frequencyScore: Math.round(frequencyScore),
    regularityScore: Math.round(regularityScore),
    overallScore
  };
}; 