import { getExercises, getWorkoutRecords } from '@/api/services';
import { logger } from '@/utils';
import { generateExportData } from '@/utils/functions';
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
    exportData: ExportData;
  }> {
    try {
      console.log('🔍 Obteniendo contexto desde datos reales del usuario...');

      // Cargar datos reales del usuario
      const exercises = await getExercises();
      const workoutRecords = await getWorkoutRecords();

      console.log(`📊 Datos obtenidos: ${exercises.length} ejercicios, ${workoutRecords.length} entrenamientos`);

      // Generar datos de exportación usando la función real
      const exportData = await generateExportData(exercises, workoutRecords);

      return { exportData };
    } catch (error) {
      logger.error('Error obteniendo contexto desde datos reales:', error as Error, undefined, 'REAL_CONTEXT');
      return this.getDefaultContext();
    }
  }



  

  /**
   * Genera un resumen de contexto desde datos reales del usuario
   */
  static generateContextSummary(context: Awaited<ReturnType<typeof this.getUserContext>>): string {
    const { exportData } = context;

    const summary = `
CONTEXTO DEL USUARIO (DATOS REALES):

📊 ESTADÍSTICAS GENERALES:
- Total de ejercicios: ${exportData.metadata.totalExercises}
- Total de entrenamientos: ${exportData.metadata.totalWorkouts}
- Volumen total: ${exportData.metadata.totalVolume.toLocaleString()} kg
- Rango de fechas: ${exportData.metadata.dateRange.from} - ${exportData.metadata.dateRange.to}
- Registros inválidos: ${(exportData.metadata as any).invalidRecordsCount || 0}

🏋️ EJERCICIOS DISPONIBLES:
${exportData.trainingDays.flatMap(day => 
  day.exercises.map(ex => `- ${ex.exerciseName} (${ex.categories.join(', ')})`)
).join('\n')}

📅 RUTINA SEMANAL:
${exportData.trainingDays.map(day =>
  `${day.dayOfWeek}: ${day.exercises.length} ejercicios - ${day.exercises.map(ex => ex.exerciseName).join(', ')}`
).join('\n')}

🎯 CATEGORÍAS DE EJERCICIOS:
${Array.from(new Set(exportData.trainingDays.flatMap(day => 
  day.exercises.flatMap(ex => ex.categories)
))).join(', ')}

📈 ÚLTIMOS ENTRENAMIENTOS (últimos 5):
${exportData.exercisesEvolution
  .filter(ex => ex.sessions.length > 0)
  .map(ex => {
    const lastSession = ex.sessions[ex.sessions.length - 1];
    return `- ${ex.exerciseName}: ${lastSession.weight}kg x ${lastSession.reps} reps (${lastSession.sets} sets) - ${lastSession.date}`;
  })
  .slice(0, 5)
  .join('\n')}

💪 PROGRESO POR DÍA:
${exportData.trainingDays.map(day =>
  `${day.dayOfWeek}: ${day.totalWorkouts} entrenamientos, ${day.totalVolume.toLocaleString()} kg volumen`
).join('\n')}

📊 ANÁLISIS DE GRUPOS MUSCULARES:
${exportData.muscleGroupAnalysis.comparison.map(comp =>
  `- ${comp.group}: ${comp.actualPercentage}% (objetivo: ${comp.targetPercentage}%) - ${comp.status}`
).join('\n')}

🎯 BALANCE DE RENDIMIENTO:
- Score: ${exportData.performanceBalance.balanceScore.score}/100
- Nivel: ${exportData.performanceBalance.balanceScore.level}
- Descripción: ${exportData.performanceBalance.balanceScore.description}

📋 DATOS COMPLETOS EN JSON:
${JSON.stringify(exportData, null, 2)}
`;

    return summary;
  }

  /**
   * Obtiene contexto por defecto cuando no hay datos de exportación
   */
  private static getDefaultContext(): Awaited<ReturnType<typeof this.getUserContext>> {
    console.log('📋 Generando contexto por defecto');
    return {
      exportData: {
        metadata: {
          exportDate: new Date().toLocaleDateString('es-ES'),
          totalExercises: 0,
          totalWorkouts: 0,
          totalVolume: 0,
          invalidRecordsCount: 0,
          dateRange: { from: '', to: '' },
          appVersion: '1.0.0'
        },
        trainingDays: [],
        exercisesEvolution: [],
        muscleGroupAnalysis: {
          totalVolume: 0,
          definedPercentages: [],
          actualPercentages: [],
          comparison: [],
          recommendations: []
        },
        performanceBalance: {
          overall: {
            totalVolume: 0,
            totalWorkouts: 0,
            averageVolumePerWorkout: 0,
            consistencyScore: 0,
            strengthProgress: 0,
            volumeProgress: 0
          },
          strengthMetrics: {
            totalExercises: 0,
            exercisesWithProgress: 0,
            averageProgressPercentage: 0,
            topImprovements: []
          },
          volumeMetrics: {
            weeklyAverage: 0,
            monthlyTrend: 'stable',
            volumeDistribution: []
          },
          balanceScore: {
            score: 0,
            level: 'needs_improvement',
            description: 'No hay datos disponibles',
            recommendations: []
          }
        }
      }
    };
  }
} 