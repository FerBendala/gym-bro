import { logger } from '@/utils';

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
 * Servicio para obtener contexto desde datos de exportación JSON
 * Proporciona datos más ricos y estructurados para el chatbot
 */
export class ExportDataContextService {
  private static readonly EXPORT_DATA_PATH = '/extra/gym-tracker-data_2025-08-07_08-53.json';

  /**
   * Obtiene el contexto completo desde los datos de exportación
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
      console.log('🔍 Obteniendo contexto desde datos de exportación...');

      // Cargar datos de exportación
      const exportData = await this.loadExportData();

      if (!exportData) {
        console.log('⚠️ No se pudieron cargar los datos de exportación');
        return this.getDefaultContext();
      }

      console.log(`📊 Datos obtenidos: ${exportData.metadata.totalExercises} ejercicios, ${exportData.metadata.totalWorkouts} entrenamientos`);

      // Procesar datos para el contexto
      const processedData = this.processExportData(exportData);

      return processedData;
    } catch (error) {
      logger.error('Error obteniendo contexto desde exportación:', error as Error, undefined, 'EXPORT_CONTEXT');
      return this.getDefaultContext();
    }
  }

  /**
   * Carga los datos de exportación JSON
   */
  private static async loadExportData(): Promise<ExportData | null> {
    try {
      const response = await fetch(this.EXPORT_DATA_PATH);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error cargando datos de exportación:', error);
      return null;
    }
  }

  /**
   * Procesa los datos de exportación para el contexto
   */
  private static processExportData(exportData: ExportData) {
    const { metadata, trainingDays } = exportData;

    // Obtener todos los ejercicios únicos
    const allExercises = new Set<string>();
    const exerciseCategories = new Set<string>();

    trainingDays.forEach(day => {
      day.exercises.forEach(exercise => {
        allExercises.add(exercise.exerciseName);
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

    // Obtener entrenamientos recientes (últimos 30 días)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentWorkouts = trainingDays.flatMap(day =>
      day.exercises.flatMap(exercise =>
        exercise.weights.map((weight, index) => ({
          exerciseName: exercise.exerciseName,
          weight,
          date: new Date(), // Placeholder - los datos de exportación no tienen fechas específicas
          reps: 10, // Placeholder
          sets: 3 // Placeholder
        }))
      )
    );

    // Obtener entrenamientos de hoy (placeholder - no hay datos específicos de hoy)
    const todayWorkouts: any[] = [];

    return {
      exercises: Array.from(allExercises).map(name => ({ name, category: 'General' })),
      assignments: trainingDays.map(day => ({
        dayOfWeek: day.dayOfWeek,
        exercises: day.exercises.map(ex => ex.exerciseName)
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
   * Genera un resumen de contexto desde datos de exportación
   */
  static generateContextSummary(context: Awaited<ReturnType<typeof this.getUserContext>>): string {
    const { exercises, assignments, workoutRecords, statistics } = context;

    const summary = `
CONTEXTO DEL USUARIO (DATOS DE EXPORTACIÓN):

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
${exercises.map(ex => `- ${ex.name} (${ex.category})`).join('\n')}

📅 RUTINA SEMANAL (${assignments.length} días):
${assignments.map(day =>
      `${day.dayOfWeek}: ${day.exercises.length} ejercicios - ${day.exercises.join(', ')}`
    ).join('\n')}

🎯 CATEGORÍAS DE EJERCICIOS:
${statistics.exerciseCategories.join(', ')}

✅ ENTRENAMIENTOS DE HOY (${statistics.todayWorkouts.length}):
${statistics.todayWorkouts.length > 0
        ? statistics.todayWorkouts.map(record =>
          `- ${record.exerciseName}: ${record.weight}kg x ${record.reps} reps (${record.sets} sets)`
        ).join('\n')
        : 'No hay entrenamientos registrados hoy'
      }

📈 ÚLTIMOS ENTRENAMIENTOS (últimos 5):
${statistics.recentWorkouts.slice(-5).map(record =>
        `- ${record.exerciseName}: ${record.weight}kg x ${record.reps} reps (${record.sets} sets)`
      ).join('\n')}

💪 PROGRESO POR DÍA:
${assignments.map(day => {
        const dayData = day as any;
        return `${dayData.dayOfWeek}: ${dayData.totalWorkouts || 0} entrenamientos, ${dayData.totalVolume || 0} kg volumen`;
      }).join('\n')}
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