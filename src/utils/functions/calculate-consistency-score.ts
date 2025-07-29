import { calculateTrainingConsistency } from './calculate-training-consistency';

import type { WorkoutRecord } from '@/interfaces';

/**
 * Calcula el score de consistencia para una categoría (función actualizada)
 * Ahora separa diferentes tipos de consistencia para mayor claridad
 */
export const calculateConsistencyScore = (categoryRecords: WorkoutRecord[], avgWorkoutsPerWeek: number): number => {
  // Usar solo la consistencia de entrenamiento para mantener compatibilidad
  const trainingConsistency = calculateTrainingConsistency(categoryRecords, avgWorkoutsPerWeek);
  return trainingConsistency.overallScore;
};
