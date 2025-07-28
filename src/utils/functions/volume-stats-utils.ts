import type { WorkoutRecord } from '@/interfaces';

/**
 * Calcula el volumen de un entrenamiento (peso × reps × sets)
 * Si tiene series individuales, calcula el volumen exacto por serie
 */
export const calculateWorkoutVolume = (record: WorkoutRecord): number => {
  // Si tiene series individuales, calcular volumen exacto
  if (record.individualSets && record.individualSets.length > 0) {
    return record.individualSets.reduce((total, set) => {
      return total + (set.weight * set.reps);
    }, 0);
  }

  // Fallback al cálculo tradicional
  return record.weight * record.reps * record.sets;
};

/**
 * Clasifica el volumen de entrenamiento en categorías
 */
export const classifyVolumeLevel = (volume: number): 'bajo' | 'moderado' | 'alto' | 'muy_alto' | 'extremo' => {
  if (volume < 100) return 'bajo';
  if (volume < 500) return 'moderado';
  if (volume < 1000) return 'alto';
  if (volume < 2000) return 'muy_alto';
  return 'extremo';
};

/**
 * Obtiene el color correspondiente a un nivel de volumen
 */
export const getVolumeColor = (volume: number): string => {
  const level = classifyVolumeLevel(volume);
  const colors = {
    bajo: 'text-gray-400',
    moderado: 'text-blue-400',
    alto: 'text-green-400',
    muy_alto: 'text-yellow-400',
    extremo: 'text-red-400'
  };
  return colors[level];
};