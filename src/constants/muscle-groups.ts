/**
 * Grupos musculares para organizar ejercicios
 * Usado en: Dashboard (filtros), análisis de balance muscular, etc.
 */

export const MUSCLE_GROUPS = {
  // Tren superior
  UPPER_BODY: {
    id: 'tren-superior',
    name: 'Tren Superior',
    categories: ['Pecho', 'Espalda', 'Hombros', 'Brazos'],
    icon: '💪',
    color: 'blue'
  },

  // Tren inferior
  LOWER_BODY: {
    id: 'tren-inferior',
    name: 'Tren Inferior',
    categories: ['Piernas'],
    icon: '🦵',
    color: 'green'
  },

  // Core
  CORE: {
    id: 'core',
    name: 'Core',
    categories: ['Core'],
    icon: '🎯',
    color: 'purple'
  },

  // Cardio
  CARDIO: {
    id: 'cardio',
    name: 'Cardio',
    categories: ['Cardio'],
    icon: '❤️',
    color: 'red'
  },

  // Funcional
  FUNCTIONAL: {
    id: 'funcional',
    name: 'Funcional',
    categories: ['Funcional'],
    icon: '⚡',
    color: 'yellow'
  },

  // Grupos específicos
  CHEST: {
    id: 'pecho',
    name: 'Pecho',
    categories: ['Pecho'],
    icon: '🏋️',
    color: 'blue'
  },

  BACK: {
    id: 'espalda',
    name: 'Espalda',
    categories: ['Espalda'],
    icon: '🔙',
    color: 'indigo'
  },

  LEGS: {
    id: 'piernas',
    name: 'Piernas',
    categories: ['Piernas'],
    icon: '🦵',
    color: 'green'
  },

  SHOULDERS: {
    id: 'hombros',
    name: 'Hombros',
    categories: ['Hombros'],
    icon: '🤸',
    color: 'orange'
  },

  ARMS: {
    id: 'brazos',
    name: 'Brazos',
    categories: ['Brazos'],
    icon: '💪',
    color: 'pink'
  }
} as const;

/**
 * Lista de todos los grupos musculares
 */
export const ALL_MUSCLE_GROUPS = Object.values(MUSCLE_GROUPS);

/**
 * Mapeo de categorías a grupos musculares
 */
export const CATEGORY_TO_MUSCLE_GROUP: Record<string, typeof MUSCLE_GROUPS[keyof typeof MUSCLE_GROUPS]> = {
  'Pecho': MUSCLE_GROUPS.CHEST,
  'Espalda': MUSCLE_GROUPS.BACK,
  'Piernas': MUSCLE_GROUPS.LEGS,
  'Hombros': MUSCLE_GROUPS.SHOULDERS,
  'Brazos': MUSCLE_GROUPS.ARMS,
  'Core': MUSCLE_GROUPS.CORE,
  'Cardio': MUSCLE_GROUPS.CARDIO,
  'Funcional': MUSCLE_GROUPS.FUNCTIONAL
};

/**
 * Obtener grupo muscular por categoría
 */
export const getMuscleGroupByCategory = (category: string) => {
  return CATEGORY_TO_MUSCLE_GROUP[category];
};

/**
 * Verificar si un ejercicio pertenece a un grupo muscular
 */
export const exerciseBelongsToMuscleGroup = (exerciseCategories: string[], muscleGroupId: string): boolean => {
  const muscleGroup = ALL_MUSCLE_GROUPS.find(group => group.id === muscleGroupId);
  if (!muscleGroup) return false;

  return exerciseCategories.some(category =>
    muscleGroup.categories.includes(category)
  );
};

/**
 * Tipos TypeScript
 */
export type MuscleGroupId = typeof MUSCLE_GROUPS[keyof typeof MUSCLE_GROUPS]['id'];
export type MuscleGroup = typeof MUSCLE_GROUPS[keyof typeof MUSCLE_GROUPS]; 