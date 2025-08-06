import type { WorkoutRecord } from '@/interfaces';

/**
 * Calcula el volumen real de un registro usando series individuales si están disponibles
 *
 * NOTA: Esta es la función principal. Los alias calculateRealVolume, calculateWorkoutVolume,
 * y calculateRecordVolume han sido eliminados para evitar redundancia.
 */
export const calculateVolume = (record: WorkoutRecord): number => {
  // Si tiene series individuales, calcular volumen sumando cada serie
  if (record.individualSets && record.individualSets.length > 0) {
    return record.individualSets.reduce((total, set) => {
      return total + (set.weight * set.reps);
    }, 0);
  }

  // Fallback: usar valores agregados
  return record.weight * record.reps * record.sets;
};
