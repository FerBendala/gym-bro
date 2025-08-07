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
      console.log('🚨 DEBUGGING ACTIVADO - Obteniendo contexto desde datos reales del usuario...');

      // Cargar datos reales del usuario
      console.log('🔍 Iniciando carga de datos...');

      let exercises;
      let workoutRecords;

      try {
        exercises = await getExercises();
        console.log('✅ Ejercicios cargados exitosamente:', exercises.length);
      } catch (error) {
        console.error('❌ Error cargando ejercicios:', error);
        return this.getDefaultContext();
      }

      try {
        workoutRecords = await getWorkoutRecords();
        console.log('✅ Entrenamientos cargados exitosamente:', workoutRecords.length);
      } catch (error) {
        console.error('❌ Error cargando entrenamientos:', error);
        return this.getDefaultContext();
      }

      console.log(`📊 Datos obtenidos: ${exercises.length} ejercicios, ${workoutRecords.length} entrenamientos`);

      // Debug: Mostrar detalles de los datos cargados
      console.log('🏋️ Ejercicios cargados:', exercises.map(ex => ({ id: ex.id, name: ex.name, categories: ex.categories })));
      console.log('📅 Entrenamientos cargados:', workoutRecords.slice(0, 5).map(record => ({
        id: record.id,
        exercise: record.exercise?.name,
        date: record.date,
        weight: record.weight,
        reps: record.reps,
        sets: record.sets
      })));

      // Resolver la relación exerciseId -> Exercise para todos los registros
      const workoutRecordsWithExercises = workoutRecords.map(record => {
        if (!record.exercise && record.exerciseId) {
          const foundExercise = exercises.find(ex => ex.id === record.exerciseId);
          if (foundExercise) {
            return {
              ...record,
              exercise: foundExercise
            };
          }
        }
        return record;
      });

      console.log(`🔗 Relaciones resueltas: ${workoutRecordsWithExercises.filter(r => r.exercise).length}/${workoutRecordsWithExercises.length} registros con ejercicios válidos`);
      
      // Debug: Mostrar algunos registros resueltos
      const sampleRecords = workoutRecordsWithExercises.slice(0, 5);
      console.log('📋 Muestra de registros resueltos:', sampleRecords.map(r => ({
        date: r.date,
        exercise: r.exercise?.name || 'No encontrado',
        exerciseId: r.exerciseId,
        weight: r.weight,
        reps: r.reps,
        sets: r.sets
      })));

      // Generar datos de exportación usando la función real
      const exportData = await generateExportData(exercises, workoutRecordsWithExercises);

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

📈 ÚLTIMOS ENTRENAMIENTOS (últimos 5 días):
${(() => {
        // Obtener todos los entrenamientos de los últimos 5 días
        const allSessions = exportData.exercisesEvolution
          .flatMap(ex => ex.sessions.map(session => ({
            exerciseName: ex.exerciseName,
            ...session
          })))
          .sort((a, b) => {
            // Ordenar por fecha (más reciente primero)
            const dateA = new Date(a.date.split('/').reverse().join('-'));
            const dateB = new Date(b.date.split('/').reverse().join('-'));
            return dateB.getTime() - dateA.getTime();
          })
          .slice(0, 10); // Mostrar hasta 10 entrenamientos más recientes

        return allSessions.map(session =>
          `- ${session.exerciseName}: ${session.weight}kg x ${session.reps} reps (${session.sets} sets) - ${session.date}`
        ).join('\n');
      })()}

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