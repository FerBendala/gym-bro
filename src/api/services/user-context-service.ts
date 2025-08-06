import { collection, getDocs, query, where } from 'firebase/firestore';

import { db } from '@/api/firebase';
import { handleFirebaseError } from './error-handler';
import type { Exercise, ExerciseAssignment, WorkoutRecord } from '@/interfaces';
import { logger } from '@/utils';

/**
 * Servicio para obtener el contexto completo del usuario
 * Proporciona datos para el chatbot con IA
 */
export class UserContextService {
  private static readonly EXERCISES_COLLECTION = 'exercises';
  private static readonly ASSIGNMENTS_COLLECTION = 'exerciseAssignments';
  private static readonly WORKOUT_RECORDS_COLLECTION = 'workoutRecords';

  /**
   * Obtiene el contexto completo del usuario para el chatbot
   * @returns Objeto con todos los datos relevantes del usuario
   */
  static async getUserContext(): Promise<{
    exercises: Exercise[];
    assignments: ExerciseAssignment[];
    workoutRecords: WorkoutRecord[];
    statistics: {
      totalExercises: number;
      totalWorkouts: number;
      recentWorkouts: WorkoutRecord[];
      exerciseCategories: string[];
      averageWeight: number;
      mostTrainedExercise: string | null;
    };
  }> {
    try {
      // Obtener todos los datos en paralelo
      const [exercises, assignments, workoutRecords] = await Promise.all([
        this.getExercises(),
        this.getAssignments(),
        this.getWorkoutRecords(),
      ]);

      // Calcular estadísticas
      const statistics = this.calculateStatistics(exercises, workoutRecords);

      return {
        exercises,
        assignments,
        workoutRecords,
        statistics,
      };
    } catch (error) {
      logger.error('Error obteniendo contexto del usuario:', error as Error, undefined, 'USER_CONTEXT');
      throw error;
    }
  }

  /**
   * Obtiene todos los ejercicios del usuario
   */
  private static async getExercises(): Promise<Exercise[]> {
    try {
      const querySnapshot = await getDocs(collection(db, this.EXERCISES_COLLECTION));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Exercise));
    } catch (error) {
      handleFirebaseError(error, 'obtener ejercicios');
      throw error;
    }
  }

  /**
   * Obtiene todas las asignaciones de ejercicios
   */
  private static async getAssignments(): Promise<ExerciseAssignment[]> {
    try {
      const querySnapshot = await getDocs(collection(db, this.ASSIGNMENTS_COLLECTION));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ExerciseAssignment));
    } catch (error) {
      handleFirebaseError(error, 'obtener asignaciones');
      throw error;
    }
  }

  /**
   * Obtiene todos los registros de entrenamiento
   */
  private static async getWorkoutRecords(): Promise<WorkoutRecord[]> {
    try {
      const querySnapshot = await getDocs(collection(db, this.WORKOUT_RECORDS_COLLECTION));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WorkoutRecord));
    } catch (error) {
      handleFirebaseError(error, 'obtener registros de entrenamiento');
      throw error;
    }
  }

  /**
   * Calcula estadísticas relevantes para el contexto
   */
  private static calculateStatistics(
    exercises: Exercise[],
    workoutRecords: WorkoutRecord[]
  ): {
    totalExercises: number;
    totalWorkouts: number;
    recentWorkouts: WorkoutRecord[];
    exerciseCategories: string[];
    averageWeight: number;
    mostTrainedExercise: string | null;
  } {
    const totalExercises = exercises.length;
    const totalWorkouts = workoutRecords.length;

    // Obtener entrenamientos recientes (últimos 30 días)
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const recentWorkouts = workoutRecords.filter(record => record.date >= thirtyDaysAgo);

    // Categorías únicas de ejercicios
    const exerciseCategories = [...new Set(exercises.map(ex => ex.category))];

    // Peso promedio de todos los entrenamientos
    const totalWeight = workoutRecords.reduce((sum, record) => sum + record.weight, 0);
    const averageWeight = totalWorkouts > 0 ? totalWeight / totalWorkouts : 0;

    // Ejercicio más entrenado
    const exerciseCounts = workoutRecords.reduce((counts, record) => {
      counts[record.exerciseId] = (counts[record.exerciseId] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    const mostTrainedExerciseId = Object.entries(exerciseCounts).reduce((max, [id, count]) => {
      return count > (max?.count || 0) ? { id, count } : max;
    }, null as { id: string; count: number } | null);

    const mostTrainedExercise = mostTrainedExerciseId 
      ? exercises.find(ex => ex.id === mostTrainedExerciseId.id)?.name || null
      : null;

    return {
      totalExercises,
      totalWorkouts,
      recentWorkouts,
      exerciseCategories,
      averageWeight,
      mostTrainedExercise,
    };
  }

  /**
   * Genera un resumen de contexto para el chatbot
   */
  static generateContextSummary(context: Awaited<ReturnType<typeof this.getUserContext>>): string {
    const { exercises, assignments, workoutRecords, statistics } = context;

    const summary = `
CONTEXTO DEL USUARIO:

📊 ESTADÍSTICAS GENERALES:
- Total de ejercicios: ${statistics.totalExercises}
- Total de entrenamientos: ${statistics.totalWorkouts}
- Entrenamientos recientes (30 días): ${statistics.recentWorkouts.length}
- Peso promedio: ${statistics.averageWeight.toFixed(1)} kg
- Ejercicio más entrenado: ${statistics.mostTrainedExercise || 'N/A'}

🏋️ EJERCICIOS DISPONIBLES (${exercises.length}):
${exercises.map(ex => `- ${ex.name} (${ex.category})`).join('\n')}

📅 ASIGNACIONES POR DÍA (${assignments.length}):
${assignments.reduce((acc, assignment) => {
  const day = assignment.dayOfWeek;
  if (!acc[day]) acc[day] = [];
  acc[day].push(assignment.exerciseId);
  return acc;
}, {} as Record<string, string[]>).map(([day, exerciseIds]) => 
  `${day}: ${exerciseIds.length} ejercicios`
).join('\n')}

🎯 CATEGORÍAS DE EJERCICIOS:
${statistics.exerciseCategories.join(', ')}

📈 ÚLTIMOS ENTRENAMIENTOS:
${statistics.recentWorkouts.slice(-5).map(record => {
  const exercise = exercises.find(ex => ex.id === record.exerciseId);
  return `- ${exercise?.name || 'Ejercicio desconocido'}: ${record.weight}kg x ${record.reps} reps (${record.sets} sets)`;
}).join('\n')}
`;

    return summary;
  }
} 