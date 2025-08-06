import { getExercises, getWorkoutRecords } from '@/api/services';
import type { Exercise, WorkoutRecord } from '@/interfaces';
import { logger } from '@/utils';

/**
 * Identifica registros de entrenamiento que no tienen ejercicios asociados
 */
export const findOrphanedRecords = async (): Promise<{
  orphanedRecords: WorkoutRecord[];
  validRecords: WorkoutRecord[];
  exercises: Exercise[];
  statistics: {
    totalRecords: number;
    orphanedCount: number;
    validCount: number;
    totalExercises: number;
  };
}> => {
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

    // Separar registros válidos de huérfanos
    const validRecords: WorkoutRecord[] = [];
    const orphanedRecords: WorkoutRecord[] = [];

    workoutRecords.forEach(record => {
      if (exercisesMap.has(record.exerciseId)) {
        // Poblar el campo exercise
        record.exercise = exercisesMap.get(record.exerciseId);
        validRecords.push(record);
      } else {
        orphanedRecords.push(record);
      }
    });

    const statistics = {
      totalRecords: workoutRecords.length,
      orphanedCount: orphanedRecords.length,
      validCount: validRecords.length,
      totalExercises: exercises.length,
    };

    // Log de estadísticas
    logger.info('Análisis de registros huérfanos:', statistics, 'CLEAN_ORPHANED_RECORDS');

    if (orphanedRecords.length > 0) {
      logger.warn('Registros huérfanos encontrados:',
        orphanedRecords.map(r => ({
          id: r.id,
          exerciseId: r.exerciseId,
          date: r.date,
          weight: r.weight,
          reps: r.reps,
          sets: r.sets
        })),
        'CLEAN_ORPHANED_RECORDS'
      );
    }

    return {
      orphanedRecords,
      validRecords,
      exercises,
      statistics,
    };
  } catch (error) {
    logger.error('Error analizando registros huérfanos:', error as Error, 'CLEAN_ORPHANED_RECORDS');
    throw error;
  }
};

/**
 * Genera un reporte de limpieza de datos
 */
export const generateCleanupReport = async (): Promise<string> => {
  try {
    const { orphanedRecords, validRecords, exercises, statistics } = await findOrphanedRecords();

    const report = `
=== REPORTE DE LIMPIEZA DE DATOS ===
Fecha: ${new Date().toLocaleString('es-ES')}

ESTADÍSTICAS GENERALES:
- Total de ejercicios: ${statistics.totalExercises}
- Total de registros: ${statistics.totalRecords}
- Registros válidos: ${statistics.validCount}
- Registros huérfanos: ${statistics.orphanedCount}
- Porcentaje de datos válidos: ${((statistics.validCount / statistics.totalRecords) * 100).toFixed(2)}%

${orphanedRecords.length > 0 ? `
REGISTROS HUÉRFANOS ENCONTRADOS:
${orphanedRecords.map((record, index) => `
${index + 1}. ID: ${record.id}
   - ExerciseID: ${record.exerciseId}
   - Fecha: ${record.date.toLocaleDateString('es-ES')}
   - Peso: ${record.weight}kg
   - Reps: ${record.reps}
   - Sets: ${record.sets}
   - Volumen: ${record.weight * record.reps * record.sets}kg
`).join('')}

RECOMENDACIONES:
1. Verificar si los ejercicios fueron eliminados accidentalmente
2. Considerar restaurar ejercicios si los datos son importantes
3. Eliminar registros huérfanos si no son necesarios
4. Revisar el proceso de eliminación de ejercicios

` : `
✅ NO SE ENCONTRARON REGISTROS HUÉRFANOS
Todos los registros de entrenamiento tienen ejercicios válidos asociados.
`}

EJERCICIOS DISPONIBLES:
${exercises.map(exercise => `- ${exercise.name} (ID: ${exercise.id})`).join('\n')}
`;

    return report;
  } catch (error) {
    logger.error('Error generando reporte de limpieza:', error as Error, 'CLEAN_ORPHANED_RECORDS');
    throw error;
  }
}; 