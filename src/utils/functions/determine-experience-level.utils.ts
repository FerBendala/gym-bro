import { EXPERIENCE_CONSTANTS } from '@/constants/prediction-utils.constants';
import type { WorkoutRecord } from '@/interfaces';
import { getValidSortedRecords } from './get-valid-sorted-records.utils';

/**
 * Determina el nivel de experiencia basado en múltiples factores
 */
export const determineExperienceLevel = (records: WorkoutRecord[]): 'beginner' | 'intermediate' | 'advanced' => {
  const validRecords = getValidSortedRecords(records);

  if (validRecords.length === 0) return 'beginner';

  const totalWeeks = Math.max(1, validRecords.length / 3); // Estimación: ~3 entrenamientos por semana
  const maxWeight = Math.max(...validRecords.map(r => r.weight));
  const exerciseVariety = new Set(validRecords.map(r => r.exercise?.name || 'unknown')).size;

  // Criterios para principiante
  const isBeginner = validRecords.length < EXPERIENCE_CONSTANTS.BEGINNER_WORKOUT_THRESHOLD ||
    totalWeeks < EXPERIENCE_CONSTANTS.BEGINNER_WEEKS_THRESHOLD ||
    maxWeight < EXPERIENCE_CONSTANTS.BEGINNER_WEIGHT_THRESHOLD ||
    exerciseVariety < EXPERIENCE_CONSTANTS.BEGINNER_EXERCISE_VARIETY;

  if (isBeginner) return 'beginner';

  // Criterios para intermedio
  const isIntermediate = validRecords.length < EXPERIENCE_CONSTANTS.INTERMEDIATE_WORKOUT_THRESHOLD ||
    totalWeeks < EXPERIENCE_CONSTANTS.INTERMEDIATE_WEEKS_THRESHOLD ||
    maxWeight < EXPERIENCE_CONSTANTS.INTERMEDIATE_WEIGHT_THRESHOLD ||
    exerciseVariety < EXPERIENCE_CONSTANTS.INTERMEDIATE_EXERCISE_VARIETY;

  if (isIntermediate) return 'intermediate';

  return 'advanced';
}; 