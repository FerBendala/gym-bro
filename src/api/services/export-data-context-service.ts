import { generateExportData } from '@/utils/functions';
import { getExercises, getWorkoutRecords } from '@/api/services';
import { logger } from '@/utils';
import type { ExportData } from '@/utils/functions/export-interfaces';



/**
 * Servicio para obtener contexto desde datos reales del usuario
 * Proporciona datos más ricos y estructurados para el chatbot
 */
export class ExportDataContextService {
  /**
   * Obtiene el contexto completo desde los datos reales del usuario
   */
  static async getUserContext(): Promise<{
    exercises: Array<{ name: string; category: string }>;
    assignments: Array<{ dayOfWeek: string; exercises: string[]; totalWorkouts: number; totalVolume: number }>;
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

      console.log(`📊 Datos obtenidos: ${exercises.length} ejercicios, ${workoutRecords.length} entrenamientos`);

      // Generar datos de exportación usando la función real
      const exportData = await generateExportData(exercises, workoutRecords);

      // Procesar datos para el contexto
      const processedData = this.processExportData(exportData);

      return processedData;
    } catch (error) {
      logger.error('Error obteniendo contexto desde datos reales:', error as Error, undefined, 'REAL_CONTEXT');
      return this.getDefaultContext();
    }
  }



  /**
   * Procesa los datos de exportación para el contexto
   */
  private static processExportData(exportData: ExportData) {
    const { metadata, trainingDays } = exportData;

    // Obtener todos los ejercicios únicos con sus categorías
    const exerciseMap = new Map<string, string[]>();
    const exerciseCategories = new Set<string>();

    trainingDays.forEach(day => {
      day.exercises.forEach(exercise => {
        exerciseMap.set(exercise.exerciseName, exercise.categories);
        exercise.categories.forEach(category => exerciseCategories.add(category));
      });
    });

    // Calcular estadísticas
    const totalVolume = metadata.totalVolume;
    const averageWeight = totalVolume / metadata.totalWorkouts;

    // Encontrar ejercicio más entrenado
    const exerciseCounts = new Map<string, number>();
    trainingDays.forEach(day => {
      day.exercises.forEach(exercise => {
        const count = exerciseCounts.get(exercise.exerciseName) || 0;
        exerciseCounts.set(exercise.exerciseName, count + exercise.workoutCount);
      });
    });

    const mostTrainedExercise = Array.from(exerciseCounts.entries())
      .reduce((max, [name, count]) => count > (max?.count || 0) ? { name, count } : max, null as { name: string; count: number } | null);

    // Crear entrenamientos recientes basados en exercisesEvolution
    const recentWorkouts: any[] = [];
    exportData.exercisesEvolution.forEach(exercise => {
      if (exercise.sessions.length > 0) {
        // Usar la sesión más reciente
        const lastSession = exercise.sessions[exercise.sessions.length - 1];
        recentWorkouts.push({
          exerciseName: exercise.exerciseName,
          weight: lastSession.weight,
          date: new Date(lastSession.date.split('/').reverse().join('-')), // Convertir fecha
          reps: lastSession.reps,
          sets: lastSession.sets,
          maxWeight: exercise.evolution.maxWeight,
          averageWeight: exercise.evolution.averageWeight,
          totalVolume: exercise.totalVolume
        });
      }
    });

    // Ordenar por fecha (más reciente primero)
    recentWorkouts.sort((a, b) => b.date.getTime() - a.date.getTime());

    // Obtener entrenamientos de hoy (no hay datos específicos de hoy en la exportación)
    const todayWorkouts: any[] = [];

    return {
      exercises: Array.from(exerciseMap.entries()).map(([name, categories]) => ({
        name,
        category: categories.join(', ')
      })),
      assignments: trainingDays.map(day => ({
        dayOfWeek: day.dayOfWeek,
        exercises: day.exercises.map(ex => ex.exerciseName),
        totalWorkouts: day.totalWorkouts,
        totalVolume: day.totalVolume
      })),
      workoutRecords: recentWorkouts,
      statistics: {
        totalExercises: metadata.totalExercises,
        totalWorkouts: metadata.totalWorkouts,
        recentWorkouts,
        todayWorkouts,
        exerciseCategories: Array.from(exerciseCategories),
        averageWeight,
        mostTrainedExercise: mostTrainedExercise?.name || null,
        totalVolume,
        dateRange: metadata.dateRange
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