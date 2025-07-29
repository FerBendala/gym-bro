import type { DataStats } from '../types';

import { getExercises, getWorkoutRecords } from '@/api/services';
import type { Exercise, WorkoutRecord } from '@/interfaces';
import { logger } from '@/utils';

/**
 * Carga las estadísticas básicas de datos
 */
export const loadDataStats = async (): Promise<DataStats | null> => {
  try {
    const [exercises, workoutRecords] = await Promise.all([
      getExercises(),
      getWorkoutRecords(),
    ]);

    const totalVolume = workoutRecords.reduce((sum, record) =>
      sum + (record.weight * record.reps * record.sets), 0,
    );

    return {
      exercises: exercises.length,
      workouts: workoutRecords.length,
      totalVolume: Math.round(totalVolume),
    };
  } catch (error) {
    logger.error('Error cargando estadísticas:', error as Error);
    return null;
  }
};

/**
 * Obtiene todos los datos para exportación
 */
export const getExportData = async (): Promise<{
  exercises: Exercise[];
  workoutRecords: WorkoutRecord[];
} | null> => {
  try {
    const [exercises, workoutRecords] = await Promise.all([
      getExercises(),
      getWorkoutRecords(),
    ]);

    if (exercises.length === 0 && workoutRecords.length === 0) {
      return null;
    }

    return { exercises, workoutRecords };
  } catch (error) {
    logger.error('Error obteniendo datos para exportación:', error as Error);
    return null;
  }
};
