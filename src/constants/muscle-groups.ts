
export interface MuscleGroup {
  id: string;
  name: string;
  categories: readonly string[];
  icon: string;
  color: string;
}

export const MUSCLE_GROUPS = {
  // Tren superior
  CHEST: {
    id: 'chest',
    name: 'Pecho',
    categories: ['Pecho'],
    icon: '💪',
    color: 'red'
  },
  BACK: {
    id: 'back',
    name: 'Espalda',
    categories: ['Espalda'],
    icon: '🦾',
    color: 'blue'
  },
  SHOULDERS: {
    id: 'shoulders',
    name: 'Hombros',
    categories: ['Hombros'],
    icon: '🏋️',
    color: 'purple'
  },
  ARMS: {
    id: 'arms',
    name: 'Brazos',
    categories: ['Brazos'],
    icon: '💪',
    color: 'orange'
  },
  // Tren inferior
  LEGS: {
    id: 'legs',
    name: 'Piernas',
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
    color: 'indigo'
  }
} as const;

export type MuscleGroupId = keyof typeof MUSCLE_GROUPS;

export const ALL_MUSCLE_GROUPS = Object.values(MUSCLE_GROUPS);

/**
 * Mapeo de categorías a grupos musculares
 */
export const CATEGORY_TO_MUSCLE_GROUP: Record<string, MuscleGroup> = {
  'Pecho': MUSCLE_GROUPS.CHEST,
  'Espalda': MUSCLE_GROUPS.BACK,
  'Piernas': MUSCLE_GROUPS.LEGS,
  'Hombros': MUSCLE_GROUPS.SHOULDERS,
  'Brazos': MUSCLE_GROUPS.ARMS,
  'Core': MUSCLE_GROUPS.CORE
};

/**
 * Obtiene el grupo muscular al que pertenece una categoría
 */
export const getMuscleGroupByCategory = (category: string): MuscleGroup | null => {
  return CATEGORY_TO_MUSCLE_GROUP[category] || null;
};

/**
 * Verifica si un ejercicio pertenece a un grupo muscular específico
 */
export const exerciseBelongsToMuscleGroup = (
  exerciseCategories: string[] = [],
  muscleGroupId: MuscleGroupId
): boolean => {
  const muscleGroup = MUSCLE_GROUPS[muscleGroupId];
  return exerciseCategories.some(category =>
    Array.from(muscleGroup.categories).includes(category)
  );
}; 