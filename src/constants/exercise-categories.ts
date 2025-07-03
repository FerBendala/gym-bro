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