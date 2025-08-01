/**
 * Utilidades para mapeo de categorías de ejercicios
 * Centraliza la lógica de categorización de ejercicios
 */

/**
 * Obtiene la categoría de un ejercicio basado en su ID
 * @param exerciseId - ID del ejercicio
 * @returns Categoría del ejercicio
 */
export const getCategoryFromExercise = (exerciseId: string): string => {
  // Mapeo de ejercicios por categoría
  const exerciseCategories: Record<string, string> = {
    // Pecho
    'bench_press': 'Pecho',
    'push_up': 'Pecho',
    'dumbbell_press': 'Pecho',
    'incline_press': 'Pecho',
    'decline_press': 'Pecho',
    'dips': 'Pecho',
    'chest_flyes': 'Pecho',

    // Espalda
    'pull_up': 'Espalda',
    'deadlift': 'Espalda',
    'barbell_row': 'Espalda',
    'dumbbell_row': 'Espalda',
    'lat_pulldown': 'Espalda',
    'face_pulls': 'Espalda',
    'reverse_flyes': 'Espalda',

    // Hombros
    'overhead_press': 'Hombros',
    'lateral_raises': 'Hombros',
    'front_raises': 'Hombros',
    'rear_delt_flyes': 'Hombros',
    'arnold_press': 'Hombros',

    // Brazos
    'bicep_curl': 'Brazos',
    'tricep_extension': 'Brazos',
    'hammer_curl': 'Brazos',
    'skull_crushers': 'Brazos',
    'preacher_curl': 'Brazos',
    'diamond_push_ups': 'Brazos',

    // Piernas
    'squat': 'Piernas',
    'leg_press': 'Piernas',
    'lunges': 'Piernas',
    'leg_curls': 'Piernas',
    'leg_extensions': 'Piernas',
    'calf_raises': 'Piernas',
    'romanian_deadlift': 'Piernas',

    // Core
    'plank': 'Core',
    'crunch': 'Core',
    'russian_twist': 'Core',
    'leg_raises': 'Core',
    'mountain_climbers': 'Core',
    'ab_wheel': 'Core',
    'side_plank': 'Core',

    // Glúteos
    'hip_thrust': 'Glúteos',
    'glute_bridge': 'Glúteos',
    'donkey_kicks': 'Glúteos',
    'fire_hydrants': 'Glúteos',
  };

  return exerciseCategories[exerciseId] || 'Otros';
};

/**
 * Obtiene todas las categorías disponibles
 * @returns Array de categorías
 */
export const getAvailableCategories = (): string[] => {
  return ['Pecho', 'Espalda', 'Hombros', 'Brazos', 'Piernas', 'Core', 'Glúteos', 'Otros'];
};

/**
 * Obtiene ejercicios por categoría
 * @param category - Categoría específica
 * @returns Array de IDs de ejercicios
 */
export const getExercisesByCategory = (category: string): string[] => {
  const exerciseCategories: Record<string, string[]> = {
    'Pecho': ['bench_press', 'push_up', 'dumbbell_press', 'incline_press', 'decline_press', 'dips', 'chest_flyes'],
    'Espalda': ['pull_up', 'deadlift', 'barbell_row', 'dumbbell_row', 'lat_pulldown', 'face_pulls', 'reverse_flyes'],
    'Hombros': ['overhead_press', 'lateral_raises', 'front_raises', 'rear_delt_flyes', 'arnold_press'],
    'Brazos': ['bicep_curl', 'tricep_extension', 'hammer_curl', 'skull_crushers', 'preacher_curl', 'diamond_push_ups'],
    'Piernas': ['squat', 'leg_press', 'lunges', 'leg_curls', 'leg_extensions', 'calf_raises', 'romanian_deadlift'],
    'Core': ['plank', 'crunch', 'russian_twist', 'leg_raises', 'mountain_climbers', 'ab_wheel', 'side_plank'],
    'Glúteos': ['hip_thrust', 'glute_bridge', 'donkey_kicks', 'fire_hydrants'],
  };

  return exerciseCategories[category] || [];
};
