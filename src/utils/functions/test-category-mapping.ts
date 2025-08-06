import { getExercises, getWorkoutRecords } from '@/api/services';
import type { Exercise } from '@/interfaces';

/**
 * Función de prueba para verificar el mapeo de categorías
 */
export const testCategoryMapping = async () => {
  try {
    const [exercises, workoutRecords] = await Promise.all([
      getExercises(),
      getWorkoutRecords(),
    ]);

    // Crear mapa de ejercicios por ID
    const exercisesMap = new Map<string, Exercise>();
    exercises.forEach(exercise => {
      exercisesMap.set(exercise.id, exercise);
    });

    // Poblar ejercicios en registros
    const recordsWithExercises = workoutRecords.map(record => ({
      ...record,
      exercise: exercisesMap.get(record.exerciseId),
    }));

    // Analizar categorías de brazos
    const bicepsExercises: string[] = [];
    const tricepsExercises: string[] = [];
    const compoundExercises: string[] = [];

    recordsWithExercises.forEach(record => {
      if (!record.exercise) return;

      const categories = record.exercise.categories;
      const exerciseName = record.exercise.name;

      if (categories.includes('Brazos')) {
        if (exerciseName.toLowerCase().includes('curl') ||
          exerciseName.toLowerCase().includes('bíceps') ||
          exerciseName.toLowerCase().includes('bicep')) {
          bicepsExercises.push(exerciseName);
        } else if (exerciseName.toLowerCase().includes('extensión') ||
          exerciseName.toLowerCase().includes('tríceps') ||
          exerciseName.toLowerCase().includes('tricep') ||
          exerciseName.toLowerCase().includes('fondos')) {
          tricepsExercises.push(exerciseName);
        } else {
          compoundExercises.push(exerciseName);
        }
      }
    });

    console.log('=== ANÁLISIS DE CATEGORÍAS DE BRAZOS ===');
    console.log('Ejercicios de Bíceps:', [...new Set(bicepsExercises)]);
    console.log('Ejercicios de Tríceps:', [...new Set(tricepsExercises)]);
    console.log('Ejercicios Compuestos:', [...new Set(compoundExercises)]);
    console.log('Total ejercicios con categoría "Brazos":',
      bicepsExercises.length + tricepsExercises.length + compoundExercises.length);

    return {
      bicepsExercises: [...new Set(bicepsExercises)],
      tricepsExercises: [...new Set(tricepsExercises)],
      compoundExercises: [...new Set(compoundExercises)],
    };
  } catch (error) {
    console.error('Error en prueba de mapeo:', error);
    throw error;
  }
}; 