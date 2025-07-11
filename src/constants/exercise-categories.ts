/**
 * Categorías de ejercicios disponibles
 * Usado en: AdminPanel, Dashboard (filtros), ExerciseCard, etc.
 */
export const EXERCISE_CATEGORIES = [
  'Pecho',
  'Espalda',
  'Piernas',
  'Hombros',
  'Brazos',
  'Core',
  'Cardio',
  'Funcional'
] as const;

export type ExerciseCategory = typeof EXERCISE_CATEGORIES[number];

/**
 * Distribución ideal de volumen por categoría muscular (porcentajes recomendados)
 * Basada en principios de anatomía funcional, prevención de lesiones y desarrollo equilibrado
 */
export const IDEAL_VOLUME_DISTRIBUTION: Record<string, number> = {
  'Pecho': 20,        // Grupo muscular grande, balance con espalda
  'Espalda': 25,      // Ligeramente más por balance postural y prevención
  'Piernas': 30,      // Grupo muscular más grande del cuerpo
  'Hombros': 15,      // Crucial para estabilidad, músculos más pequeños
  'Brazos': 10,       // Músculos más pequeños, se benefician del trabajo indirecto
  'Core': 10,         // Fundamental para estabilidad y fuerza funcional
  'Cardio': 5,        // Complementario al entrenamiento de fuerza
  'Funcional': 10     // Movimientos funcionales y ejercicios compuestos
};

/**
 * Obtiene el porcentaje ideal de volumen para una categoría específica
 */
export const getIdealVolumePercentage = (categoryName: string): number => {
  return IDEAL_VOLUME_DISTRIBUTION[categoryName] || 15; // 15% por defecto para categorías no definidas
}; 