import type { ExerciseCategory } from '../types';

import type { Exercise } from '@/interfaces';

/**
 * Obtiene un array de categorías con el conteo de ejercicios cada una
 * @param exercises - Arreglo de ejercicios
 * @returns Arreglo de categorías con conteo de ejercicios
 * @example
 * const exercises = [
 *   { id: '1', name: 'Sentadillas', categories: ['Piernas'] },
 *   { id: '2', name: 'Press de hombros', categories: ['Hombros'] },
 *   { id: '3', name: 'Flexiones de brazos', categories: ['Brazos'] },
 *   { id: '4', name: 'Elevaciones laterales', categories: ['Hombros', 'Brazos'] },
 * ];
 * const categories = getCategoriesWithCount(exercises);
 */
export const getCategoriesWithCount = (exercises: Exercise[]) => {
  // Filtrar ejercicios válidos (con nombre)
  const validExercises = exercises.filter(ex => ex.name && typeof ex.name === 'string');

  const categories = [
    { id: 'all', name: 'Todos', count: validExercises.length },
  ];

  // Importar dinámicamente para evitar dependencias circulares
  const EXERCISE_CATEGORIES = [
    'Pecho', 'Espalda', 'Hombros', 'Bíceps', 'Tríceps',
    'Piernas', 'Abdominales',
  ];

  EXERCISE_CATEGORIES.forEach(category => {
    const count = validExercises.filter(ex => ex.categories?.includes(category)).length;
    if (count > 0) {
      categories.push({ id: category, name: category, count });
    }
  });

  return categories;
};

/**
 * Filtra los ejercicios por categoría seleccionada
 * Si la categoría seleccionada es 'all', devuelve todos los ejercicios ordenados alfabéticamente
 * De lo contrario, devuelve los ejercicios que pertenecen a la categoría seleccionada, ordenados alfabéticamente
 * @param exercises Listado de ejercicios
 * @param selectedCategory Categoría seleccionada
 * @returns Listado de ejercicios filtrados
 */
export const filterExercisesByCategory = (
  exercises: Exercise[],
  selectedCategory: ExerciseCategory,
) => {
  // Filtrar ejercicios válidos (con nombre)
  const validExercises = exercises.filter(ex => ex.name && typeof ex.name === 'string');

  if (selectedCategory === 'all') {
    return validExercises.sort((a, b) => a.name.localeCompare(b.name));
  }
  return validExercises
    .filter(ex => ex.categories?.includes(selectedCategory))
    .sort((a, b) => a.name.localeCompare(b.name));
};

/**
 * Formatea un día de la semana para que esté en singular y con mayúscula
 * @param day Día de la semana en singular (lunes, martes, etc.)
 * @returns Día de la semana con mayúscula (Lunes, Martes, etc.)
 */
export const formatDayName = (day: string) => {
  return day.charAt(0).toUpperCase() + day.slice(1);
};

/**
 * Valida si una cadena es una URL válida
 * @param url Cadena a validar
 * @returns Verdadero si la cadena es una URL válida, falso en caso contrario
 */
export const validateURL = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};
