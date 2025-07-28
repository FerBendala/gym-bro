import type { WorkoutRecord } from '@/interfaces';

/**
 * Calcula el volumen real de un registro usando series individuales si están disponibles
 * FUNCIÓN UNIFICADA: Reemplaza calculateRealVolume, calculateWorkoutVolume, y calculateRecordVolume
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

// ALIASES PARA MANTENER COMPATIBILIDAD
export const calculateRealVolume = calculateVolume;
export const calculateWorkoutVolume = calculateVolume;
export const calculateRecordVolume = calculateVolume; 