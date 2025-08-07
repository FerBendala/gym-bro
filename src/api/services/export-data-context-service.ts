import { logger } from '@/utils';
import { getExercises, getWorkoutRecords, getAssignmentsByDay } from '@/api/services';
import type { DayOfWeek } from '@/interfaces';

interface TrainingDay {
  dayOfWeek: string;
  dayName: string;
  totalWorkouts: number;
  totalVolume: number;
  exercises: ExerciseData[];
}

interface ExerciseData {
  exerciseName: string;
  categories: string[];
  totalVolume: number;
  workoutCount: number;
  averageWeight: number;
  maxWeight: number;
  lastWorkout: string;
  weights: number[];
}

interface ExportData {
  metadata: {
    exportDate: string;
    totalExercises: number;
    totalWorkouts: number;
    totalVolume: number;
    invalidRecordsCount: number;
    dateRange: {
      from: string;
      to: string;
    };
    appVersion: string;
  };
  trainingDays: TrainingDay[];
}

/**
 * Servicio para obtener contexto desde datos reales del usuario
 * Proporciona datos más ricos y estructurados para el chatbot
 */
export class ExportDataContextService {
  /**
   * Obtiene el contexto completo desde los datos reales del usuario
   */
  static async getUserContext(): Promise<{
    exercises: any[];
    assignments: any[];
    workoutRecords: any[];
    statistics: {
      totalExercises: number;
      totalWorkouts: number;
      recentWorkouts: any[];
      todayWorkouts: any[];
      exerciseCategories: string[];
      averageWeight: number;
      mostTrainedExercise: string | null;
      totalVolume: number;
      dateRange: { from: string; to: string };
    };
  }> {
    try {
      console.log('🔍 Obteniendo contexto desde datos reales del usuario...');

      // Cargar datos reales del usuario
      const exercises = await getExercises();
      const workoutRecords = await getWorkoutRecords();
      
      // Obtener assignments para todos los días de la semana
      const daysOfWeek: DayOfWeek[] = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
      const allAssignments = await Promise.all(
        daysOfWeek.map(day => getAssignmentsByDay(day))
      );

      console.log(`📊 Datos obtenidos: ${exercises.length} ejercicios, ${workoutRecords.length} entrenamientos`);

      // Procesar datos para el contexto
      const processedData = this.processRealData(exercises, workoutRecords, allAssignments, daysOfWeek);

      return processedData;
    } catch (error) {
      logger.error('Error obteniendo contexto desde datos reales:', error as Error, undefined, 'REAL_CONTEXT');
      return this.getDefaultContext();
    }
  }

  /**
   * Procesa los datos reales del usuario para el contexto
   */
  private static processRealData(exercises: any[], workoutRecords: any[], allAssignments: any[][], daysOfWeek: string[]) {
    // Calcular estadísticas básicas
    const totalExercises = exercises.length;
    const totalWorkouts = workoutRecords.length;
    
    // Calcular volumen total y peso promedio
    let totalVolume = 0;
    let totalWeight = 0;
    let weightCount = 0;

    workoutRecords.forEach(record => {
      if (record.weight && record.reps && record.sets) {
        const volume = record.weight * record.reps * record.sets;
        totalVolume += volume;
        totalWeight += record.weight;
        weightCount++;
      }
    });

    const averageWeight = weightCount > 0 ? totalWeight / weightCount : 0;

    // Encontrar ejercicio más entrenado
    const exerciseCounts = new Map<string, number>();
    workoutRecords.forEach(record => {
      const count = exerciseCounts.get(record.exerciseName) || 0;
      exerciseCounts.set(record.exerciseName, count + 1);
    });

    const mostTrainedExercise = Array.from(exerciseCounts.entries())
      .reduce((max, [name, count]) => count > (max?.count || 0) ? { name, count } : max, null as { name: string; count: number } | null);

    // Obtener categorías de ejercicios
    const exerciseCategories = new Set<string>();
    exercises.forEach(exercise => {
      if (exercise.category) {
        exerciseCategories.add(exercise.category);
      }
    });

    // Obtener entrenamientos recientes (últimos 30 días)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentWorkouts = workoutRecords
      .filter(record => new Date(record.date) >= thirtyDaysAgo)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Obtener entrenamientos de hoy
    const today = new Date();
    const todayWorkouts = workoutRecords.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate.toDateString() === today.toDateString();
    });

    // Calcular rango de fechas
    const dates = workoutRecords.map(record => new Date(record.date)).sort((a, b) => a.getTime() - b.getTime());
    const dateRange = {
      from: dates.length > 0 ? dates[0].toLocaleDateString('es-ES') : '',
      to: dates.length > 0 ? dates[dates.length - 1].toLocaleDateString('es-ES') : ''
    };

    // Procesar assignments por día
    const assignments = daysOfWeek.map((day, index) => ({
      dayOfWeek: day,
      exercises: allAssignments[index] || [],
      totalWorkouts: 0, // No disponible en assignments
      totalVolume: 0 // No disponible en assignments
    }));

    return {
      exercises: exercises.map(exercise => ({
        name: exercise.name,
        category: exercise.category || 'Sin categoría'
      })),
      assignments,
      workoutRecords: recentWorkouts,
      statistics: {
        totalExercises,
        totalWorkouts,
        recentWorkouts,
        todayWorkouts,
        exerciseCategories: Array.from(exerciseCategories),
        averageWeight,
        mostTrainedExercise: mostTrainedExercise?.name || null,
        totalVolume,
        dateRange
      }
    };
  }

  /**
   * Genera un resumen de contexto desde datos reales del usuario
   */
  static generateContextSummary(context: Awaited<ReturnType<typeof this.getUserContext>>): string {
    const { exercises, assignments, workoutRecords, statistics } = context;

    const summary = `
CONTEXTO DEL USUARIO (DATOS REALES):

📊 ESTADÍSTICAS GENERALES:
- Total de ejercicios: ${statistics.totalExercises}
- Total de entrenamientos: ${statistics.totalWorkouts}
- Volumen total: ${statistics.totalVolume.toLocaleString()} kg
- Rango de fechas: ${statistics.dateRange.from} - ${statistics.dateRange.to}
- Entrenamientos recientes (30 días): ${statistics.recentWorkouts.length}
- Entrenamientos de HOY: ${statistics.todayWorkouts.length}
- Peso promedio: ${statistics.averageWeight.toFixed(1)} kg
- Ejercicio más entrenado: ${statistics.mostTrainedExercise || 'N/A'}

🏋️ EJERCICIOS DISPONIBLES (${exercises.length}):
${exercises.length > 0 
      ? exercises.map(ex => `- ${ex.name} (${ex.category})`).join('\n')
      : 'No hay ejercicios registrados'
    }

📅 RUTINA SEMANAL (${assignments.length} días):
${assignments.length > 0
      ? assignments.map(day =>
          `${day.dayOfWeek}: ${day.exercises.length} ejercicios - ${day.exercises.join(', ')}`
        ).join('\n')
      : 'No hay rutina semanal configurada'
    }

🎯 CATEGORÍAS DE EJERCICIOS:
${statistics.exerciseCategories.length > 0 
      ? statistics.exerciseCategories.join(', ')
      : 'No hay categorías definidas'
    }

✅ ENTRENAMIENTOS DE HOY (${statistics.todayWorkouts.length}):
${statistics.todayWorkouts.length > 0
        ? statistics.todayWorkouts.map(record =>
          `- ${record.exerciseName}: ${record.weight}kg x ${record.reps} reps (${record.sets} sets)`
        ).join('\n')
        : 'No hay entrenamientos registrados hoy'
      }

  📈 ÚLTIMOS ENTRENAMIENTOS (últimos 5):
${statistics.recentWorkouts.slice(0, 5).length > 0
        ? statistics.recentWorkouts.slice(0, 5).map(record =>
          `- ${record.exerciseName}: ${record.weight}kg x ${record.reps} reps (${record.sets} sets) - ${new Date(record.date).toLocaleDateString('es-ES')}`
        ).join('\n')
        : 'No hay entrenamientos recientes'
      }

  💪 PROGRESO POR DÍA:
${assignments.length > 0
        ? assignments.map(day => {
            const dayData = day as any;
            return `${dayData.dayOfWeek}: ${dayData.exercises.length} ejercicios asignados`;
          }).join('\n')
        : 'No hay progreso por día disponible'
      }
`;

    return summary;
  }

  /**
   * Obtiene contexto por defecto cuando no hay datos de exportación
   */
  private static getDefaultContext(): Awaited<ReturnType<typeof this.getUserContext>> {
    console.log('📋 Generando contexto por defecto');
    return {
      exercises: [],
      assignments: [],
      workoutRecords: [],
      statistics: {
        totalExercises: 0,
        totalWorkouts: 0,
        recentWorkouts: [],
        todayWorkouts: [],
        exerciseCategories: [],
        averageWeight: 0,
        mostTrainedExercise: null,
        totalVolume: 0,
        dateRange: { from: '', to: '' }
      },
    };
  }
} 