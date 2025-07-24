/**
 * Utilidades genéricas para el manejo de selects
 * Reutilizable en formularios, filtros, configuraciones, etc.
 */

import { EXERCISE_CATEGORIES } from '../../constants/exercise.constants';
import type { Exercise } from '../../interfaces';
import type { SelectGroup, SelectOption } from '../../interfaces/ui';

/**
 * Crea una opción de select estándar
 */
export const createSelectOption = (
  value: string,
  label: string,
  disabled = false
): SelectOption => ({
  value,
  label,
  disabled
});

/**
 * Crea múltiples opciones de select desde un array de strings
 */
export const createSelectOptionsFromStrings = (
  items: string[],
  labelFormatter?: (item: string) => string
): SelectOption[] => {
  return items.map(item => createSelectOption(
    item,
    labelFormatter ? labelFormatter(item) : item
  ));
};

/**
 * Crea opciones de select desde un objeto key-value
 */
export const createSelectOptionsFromObject = (
  obj: Record<string, string>
): SelectOption[] => {
  return Object.entries(obj).map(([value, label]) =>
    createSelectOption(value, label)
  );
};

/**
 * Crea una opción de placeholder/default
 */
export const createPlaceholderOption = (
  label = 'Seleccionar...',
  value = ''
): SelectOption => ({
  value,
  label,
  disabled: false
});

/**
 * Filtra opciones basándose en un texto de búsqueda
 */
export const filterSelectOptions = (
  options: SelectOption[],
  searchText: string
): SelectOption[] => {
  if (!searchText.trim()) return options;

  const search = searchText.toLowerCase();
  return options.filter(option =>
    option.label.toLowerCase().includes(search) ||
    option.value.toLowerCase().includes(search)
  );
};

/**
 * Encuentra una opción por su valor
 */
export const findOptionByValue = (
  options: SelectOption[],
  value: string
): SelectOption | undefined => {
  return options.find(option => option.value === value);
};

/**
 * Obtiene el label de una opción por su valor
 */
export const getOptionLabel = (
  options: SelectOption[],
  value: string,
  fallback = value
): string => {
  const option = findOptionByValue(options, value);
  return option?.label || fallback;
};

/**
 * Valida si un valor existe en las opciones disponibles
 */
export const isValidSelectValue = (
  options: SelectOption[],
  value: string
): boolean => {
  return options.some(option => option.value === value && !option.disabled);
};

/**
 * Agrupa opciones por categoría
 */
export const groupSelectOptions = (
  options: SelectOption[]
): SelectGroup[] => {
  const groups = new Map<string, SelectOption[]>();

  options.forEach(option => {
    const groupName = option.group || 'Sin categoría';
    if (!groups.has(groupName)) {
      groups.set(groupName, []);
    }
    groups.get(groupName)!.push(option);
  });

  return Array.from(groups.entries()).map(([label, options]) => ({
    label,
    options
  }));
};

/**
 * Ordena opciones alfabéticamente por label
 */
export const sortSelectOptions = (
  options: SelectOption[],
  direction: 'asc' | 'desc' = 'asc'
): SelectOption[] => {
  return [...options].sort((a, b) => {
    const comparison = a.label.localeCompare(b.label, 'es');
    return direction === 'asc' ? comparison : -comparison;
  });
};

/**
 * Convierte un enum en opciones de select
 */
export const enumToSelectOptions = <T extends Record<string, string>>(
  enumObject: T,
  labelFormatter?: (key: string, value: string) => string
): SelectOption[] => {
  return Object.entries(enumObject).map(([key, value]) =>
    createSelectOption(
      value,
      labelFormatter ? labelFormatter(key, value) : value
    )
  );
};

/**
 * Agrupa ejercicios por categoría para su uso en Select con optgroups
 * Ahora maneja ejercicios con múltiples categorías
 */
export const groupExercisesByCategory = (exercises: Exercise[]): SelectGroup[] => {
  // Crear un mapa de categorías con sus ejercicios
  const exercisesByCategory = new Map<string, Exercise[]>();

  // Inicializar todas las categorías
  EXERCISE_CATEGORIES.forEach(category => {
    exercisesByCategory.set(category, []);
  });

  // Agregar categoría especial para ejercicios sin categorías
  exercisesByCategory.set('Sin categoría', []);

  // Agrupar ejercicios por categoría
  exercises.forEach(exercise => {
    if (exercise.categories && exercise.categories.length > 0) {
      // Un ejercicio puede aparecer en múltiples categorías
      exercise.categories.forEach(category => {
        if (exercisesByCategory.has(category)) {
          exercisesByCategory.get(category)!.push(exercise);
        } else {
          // Si la categoría no existe en EXERCISE_CATEGORIES, crear un grupo "Otros"
          if (!exercisesByCategory.has('Otros')) {
            exercisesByCategory.set('Otros', []);
          }
          exercisesByCategory.get('Otros')!.push(exercise);
        }
      });
    } else {
      // Ejercicios sin categorías
      exercisesByCategory.get('Sin categoría')!.push(exercise);
    }
  });

  // Convertir a formato SelectGroup, solo incluyendo categorías que tengan ejercicios
  const groups: SelectGroup[] = [];

  exercisesByCategory.forEach((exercises, category) => {
    if (exercises.length > 0) {
      groups.push({
        label: category,
        options: exercises
          .sort((a, b) => a.name.localeCompare(b.name)) // Ordenar alfabéticamente
          .map(exercise => ({
            value: exercise.id,
            label: exercise.name
          }))
      });
    }
  });

  // Ordenar grupos según el orden de EXERCISE_CATEGORIES
  return groups.sort((a, b) => {
    const aIndex = EXERCISE_CATEGORIES.indexOf(a.label as any);
    const bIndex = EXERCISE_CATEGORIES.indexOf(b.label as any);

    // Si ambos están en EXERCISE_CATEGORIES, usar ese orden
    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex;
    }

    // Si solo uno está en EXERCISE_CATEGORIES, ponerlo primero
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;

    // Si ninguno está (ej: "Otros", "Sin categoría"), ordenar alfabéticamente
    return a.label.localeCompare(b.label);
  });
};

/**
 * Cuenta el total de ejercicios en todos los grupos
 */
export const countExercisesInGroups = (groups: SelectGroup[]): number => {
  return groups.reduce((total, group) => total + group.options.length, 0);
};

/**
 * Busca un ejercicio por ID en los grupos
 */
export const findExerciseInGroups = (groups: SelectGroup[], exerciseId: string): string | null => {
  for (const group of groups) {
    const exercise = group.options.find(option => option.value === exerciseId);
    if (exercise) {
      return exercise.label;
    }
  }
  return null;
}; 