/**
 * Categorías disponibles para ejercicios
 */
export const EXERCISE_CATEGORIES = [
  'Pecho',
  'Espalda',
  'Piernas',
  'Hombros',
  'Brazos',
  'Core'
] as const;

export type ExerciseCategory = typeof EXERCISE_CATEGORIES[number];

/**
 * Distribución ideal de volumen por categoría muscular (porcentajes recomendados)
 * Basada en principios de anatomía funcional, prevención de lesiones y desarrollo equilibrado
 */
export const IDEAL_VOLUME_DISTRIBUTION: Record<string, number> = {
  'Pecho': 20,        // Aumentado por redistribución
  'Espalda': 25,      // Aumentado por balance postural y redistribución  
  'Piernas': 30,      // Reducido ligeramente por redistribución
  'Hombros': 10,      // Mantenido
  'Brazos': 10,        // Reducido ligeramente
  'Core': 5          // Reducido ligeramente
};

/**
 * Obtiene el porcentaje ideal de volumen para una categoría específica
 */
export const getIdealVolumePercentage = (categoryName: string): number => {
  return IDEAL_VOLUME_DISTRIBUTION[categoryName] || 15; // 15% por defecto para categorías no definidas
}; 