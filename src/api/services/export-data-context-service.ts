import { getExercises, getWorkoutRecords } from '@/api/services';
import { IDEAL_VOLUME_DISTRIBUTION } from '@/constants';
import { logger } from '@/utils';
import { STORES } from '@/utils/data/indexeddb-config';
import { getAllItems, initializeDB } from '@/utils/data/indexeddb-utils';
import { analyzeMuscleBalance, calculateBalanceScore, calculateCategoryAnalysis } from '@/utils/functions';
import { calculateConsistencyScore } from '@/utils/functions/calculate-consistency-score';
import { getCategoryFromExercise } from '@/utils/functions/exercise-categories.utils';
import { calculateTemporalTrends } from '@/utils/functions/temporal-trends';
import { calculateVolume } from '@/utils/functions/volume-calculations';

/**
 * Servicio para obtener contexto desde datos reales del usuario
 * Proporciona datos más ricos y estructurados para el chatbot
 */
export class ExportDataContextService {
  /**
   * Obtiene el contexto completo desde los datos reales del usuario
   */
  static async getUserContext(): Promise<{
    exportData: any;
  }> {
    try {
      console.log('🚨 DEBUGGING ACTIVADO - Obteniendo contexto desde datos reales del usuario...');
      console.log('🔍 Iniciando proceso de carga de datos...');

      // Cargar datos reales del usuario
      console.log('🔍 Iniciando carga de datos...');

      let exercises;
      let workoutRecords;

      try {
        // Inicializar IndexedDB primero
        console.log('🔍 Inicializando IndexedDB...');
        await initializeDB();
        console.log('✅ IndexedDB inicializado');

        // Cargar ejercicios desde IndexedDB
        console.log('🔍 Cargando ejercicios desde IndexedDB...');
        const exercisesResult = await getAllItems(STORES.EXERCISES);
        console.log('📊 Resultado ejercicios:', exercisesResult);

        if (exercisesResult.success && exercisesResult.data && exercisesResult.data.length > 0) {
          exercises = exercisesResult.data;
          console.log('✅ Ejercicios cargados desde IndexedDB:', exercises.length);
        } else {
          console.log('⚠️ IndexedDB vacío, intentando Firebase...');
          exercises = await getExercises();
          console.log('✅ Ejercicios cargados desde Firebase:', exercises.length);
        }
      } catch (error) {
        console.error('❌ Error cargando ejercicios:', error);
        return this.getDefaultContext();
      }

      try {
        // Cargar entrenamientos desde IndexedDB
        console.log('🔍 Cargando entrenamientos desde IndexedDB...');
        const workoutRecordsResult = await getAllItems(STORES.WORKOUT_RECORDS);
        console.log('📊 Resultado entrenamientos:', workoutRecordsResult);

        if (workoutRecordsResult.success && workoutRecordsResult.data && workoutRecordsResult.data.length > 0) {
          workoutRecords = workoutRecordsResult.data;
          console.log('✅ Entrenamientos cargados desde IndexedDB:', workoutRecords.length);
        } else {
          console.log('⚠️ IndexedDB vacío, intentando Firebase...');
          workoutRecords = await getWorkoutRecords();
          console.log('✅ Entrenamientos cargados desde Firebase:', workoutRecords.length);
        }
      } catch (error) {
        console.error('❌ Error cargando entrenamientos:', error);
        return this.getDefaultContext();
      }

      console.log(`📊 Datos obtenidos: ${exercises.length} ejercicios, ${workoutRecords.length} entrenamientos`);

      // Debug: Mostrar detalles de los datos cargados
      console.log('🏋️ Ejercicios cargados:', exercises.map((ex: any) => ({ id: ex.id, name: ex.name, categories: ex.categories })));
      console.log('📅 Entrenamientos cargados:', workoutRecords.slice(0, 5).map((record: any) => ({
        id: record.id,
        exercise: record.exercise?.name,
        date: record.date,
        weight: record.weight,
        reps: record.reps,
        sets: record.sets
      })));

      // Verificar si hay datos recientes
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const recentRecords = workoutRecords.filter((record: any) => {
        const recordDate = new Date(record.date);
        return recordDate >= yesterday;
      });

      console.log('📅 Entrenamientos recientes (último día):', recentRecords.length);
      console.log('📅 Fechas de entrenamientos recientes:', recentRecords.map((r: any) => ({
        date: r.date,
        exercise: r.exercise?.name || 'Sin ejercicio',
        weight: r.weight
      })));

      // Resolver la relación exerciseId -> Exercise para todos los registros
      const workoutRecordsWithExercises = workoutRecords.map((record: any) => {
        if (!record.exercise && record.exerciseId) {
          const foundExercise = exercises.find((ex: any) => ex.id === record.exerciseId);
          if (foundExercise) {
            return {
              ...record,
              exercise: foundExercise
            };
          }
        }
        return record;
      });

      console.log(`🔗 Relaciones resueltas: ${workoutRecordsWithExercises.filter((r: any) => r.exercise).length}/${workoutRecordsWithExercises.length} registros con ejercicios válidos`);

      // Debug: Mostrar algunos registros resueltos
      const sampleRecords = workoutRecordsWithExercises.slice(0, 5);
      console.log('📋 Muestra de registros resueltos:', sampleRecords.map((r: any) => ({
        date: r.date,
        exercise: r.exercise?.name || 'No encontrado',
        exerciseId: r.exerciseId,
        weight: r.weight,
        reps: r.reps,
        sets: r.sets
      })));

      // Usar únicamente las funciones del dashboard para consistencia total
      const muscleBalance = analyzeMuscleBalance(workoutRecordsWithExercises);
      const balanceScore = calculateBalanceScore(muscleBalance);
      const categoryAnalysis = calculateCategoryAnalysis(workoutRecordsWithExercises);

      // Calcular métricas adicionales usando funciones del dashboard
      const totalVolume = workoutRecordsWithExercises.reduce((sum: number, record: any) =>
        sum + calculateVolume(record), 0);

      // Calcular consistencia general
      const consistencyScore = this.calculateOverallConsistency(workoutRecordsWithExercises);

      // Calcular progreso de fuerza
      const strengthProgress = this.calculateStrengthProgress(categoryAnalysis.categoryMetrics);

      // Calcular progreso de volumen
      const volumeProgress = this.calculateVolumeProgress(workoutRecordsWithExercises);

      // Generar datos de exportación usando solo las funciones del dashboard
      const exportData = {
        metadata: {
          exportDate: new Date().toLocaleDateString('es-ES'),
          totalExercises: exercises.length,
          totalWorkouts: workoutRecordsWithExercises.length,
          totalVolume,
          dateRange: {
            from: workoutRecordsWithExercises.length > 0 ?
              new Date(Math.min(...workoutRecordsWithExercises.map((r: any) => new Date(r.date).getTime()))).toLocaleDateString('es-ES') : '',
            to: workoutRecordsWithExercises.length > 0 ?
              new Date(Math.max(...workoutRecordsWithExercises.map((r: any) => new Date(r.date).getTime()))).toLocaleDateString('es-ES') : '',
          },
          appVersion: '1.0.0'
        },
        trainingDays: this.generateTrainingDaysData(workoutRecordsWithExercises, exercises),
        exercisesEvolution: this.generateExercisesEvolutionData(workoutRecordsWithExercises, exercises),
        muscleGroupAnalysis: {
          totalVolume,
          definedPercentages: Object.entries(IDEAL_VOLUME_DISTRIBUTION).map(([group, targetPercentage]) => ({
            group,
            targetPercentage,
          })),
          actualPercentages: muscleBalance.map(balance => ({
            group: balance.category,
            actualVolume: balance.volume,
            actualPercentage: balance.percentage,
            workoutCount: balance.weeklyFrequency * 4,
          })),
          comparison: muscleBalance.map(balance => ({
            group: balance.category,
            targetPercentage: balance.idealPercentage,
            actualPercentage: balance.percentage,
            difference: balance.deviation,
            status: balance.isBalanced ? 'balanced' : balance.deviation > 0 ? 'above' : 'below',
          })),
          recommendations: muscleBalance.map(balance => ({
            group: balance.category,
            message: balance.recommendation,
            priority: balance.priorityLevel === 'critical' ? 'high' : balance.priorityLevel,
          })),
        },
        performanceBalance: {
          overall: {
            totalVolume,
            totalWorkouts: workoutRecordsWithExercises.length,
            averageVolumePerWorkout: workoutRecordsWithExercises.length > 0 ?
              totalVolume / workoutRecordsWithExercises.length : 0,
            consistencyScore,
            strengthProgress,
            volumeProgress,
          },
          strengthMetrics: {
            totalExercises: exercises.length,
            exercisesWithProgress: categoryAnalysis.categoryMetrics.filter((m: any) => m.weightProgression > 0).length,
            averageProgressPercentage: categoryAnalysis.categoryMetrics.reduce((sum: number, m: any) =>
              sum + m.weightProgression, 0) / Math.max(1, categoryAnalysis.categoryMetrics.length),
            topImprovements: categoryAnalysis.categoryMetrics
              .filter((m: any) => m.weightProgression > 0)
              .sort((a: any, b: any) => b.weightProgression - a.weightProgression)
              .slice(0, 5)
              .map((m: any) => ({
                exerciseName: m.category,
                progressPercentage: m.weightProgression,
                weightGain: m.maxWeight - m.minWeight,
              })),
          },
          volumeMetrics: {
            weeklyAverage: workoutRecordsWithExercises.reduce((sum: number, record: any) =>
              sum + calculateVolume(record), 0) / Math.max(1, Math.ceil(workoutRecordsWithExercises.length / 7)),
            monthlyTrend: this.calculateMonthlyTrend(workoutRecordsWithExercises),
            volumeDistribution: muscleBalance.map(balance => ({
              category: balance.category,
              volume: balance.volume,
              percentage: balance.percentage,
            })),
          },
          balanceScore: {
            score: balanceScore,
            level: balanceScore >= 80 ? 'excellent' :
              balanceScore >= 60 ? 'good' :
                balanceScore >= 40 ? 'fair' : 'needs_improvement',
            description: balanceScore >= 80 ? 'Excelente rendimiento general. Mantén la consistencia.' :
              balanceScore >= 60 ? 'Buen rendimiento. Hay áreas de mejora.' :
                balanceScore >= 40 ? 'Rendimiento regular. Necesitas mejorar varios aspectos.' : 'Necesitas mejorar significativamente tu rendimiento.',
            recommendations: muscleBalance
              .filter(balance => !balance.isBalanced)
              .map(balance => balance.recommendation)
              .slice(0, 3),
          },
        },
      };

      return { exportData };
    } catch (error) {
      logger.error('Error obteniendo contexto desde datos reales:', error as Error, undefined, 'REAL_CONTEXT');
      return this.getDefaultContext();
    }
  }

  /**
   * Calcula la consistencia general del entrenamiento
   */
  private static calculateOverallConsistency(records: any[]): number {
    if (records.length === 0) return 0;

    // Agrupar por categoría y calcular consistencia por categoría
    const categoryConsistencies: number[] = [];
    const categories = new Set(records.map((r: any) => getCategoryFromExercise(r.exerciseId)));

    categories.forEach(category => {
      const categoryRecords = records.filter((r: any) => getCategoryFromExercise(r.exerciseId) === category);
      if (categoryRecords.length > 0) {
        const avgWorkoutsPerWeek = categoryRecords.length / Math.max(1, this.getWeeksSpan(categoryRecords));
        const consistency = calculateConsistencyScore(categoryRecords, avgWorkoutsPerWeek);
        categoryConsistencies.push(consistency);
      }
    });

    return categoryConsistencies.length > 0
      ? Math.round(categoryConsistencies.reduce((sum, score) => sum + score, 0) / categoryConsistencies.length)
      : 0;
  }

  /**
   * Calcula el progreso de fuerza general
   */
  private static calculateStrengthProgress(categoryMetrics: any[]): number {
    if (categoryMetrics.length === 0) return 0;

    const progressScores = categoryMetrics
      .filter((metric: any) => metric.weightProgression !== undefined)
      .map((metric: any) => Math.max(0, metric.weightProgression));

    return progressScores.length > 0
      ? Math.round(progressScores.reduce((sum, score) => sum + score, 0) / progressScores.length)
      : 0;
  }

  /**
   * Calcula el progreso de volumen general
   */
  private static calculateVolumeProgress(records: any[]): number {
    if (records.length < 2) return 0;

    // Dividir registros en dos períodos
    const sortedRecords = [...records].sort((a: any, b: any) =>
      new Date(a.date).getTime() - new Date(b.date).getTime());

    const midpoint = Math.floor(sortedRecords.length / 2);
    const firstHalf = sortedRecords.slice(0, midpoint);
    const secondHalf = sortedRecords.slice(midpoint);

    if (firstHalf.length === 0 || secondHalf.length === 0) return 0;

    const firstHalfVolume = firstHalf.reduce((sum: number, record: any) =>
      sum + calculateVolume(record), 0) / firstHalf.length;

    const secondHalfVolume = secondHalf.reduce((sum: number, record: any) =>
      sum + calculateVolume(record), 0) / secondHalf.length;

    if (firstHalfVolume === 0) return 0;

    return Math.round(((secondHalfVolume - firstHalfVolume) / firstHalfVolume) * 100);
  }

  /**
   * Calcula el número de semanas que abarcan los registros
   */
  private static getWeeksSpan(records: any[]): number {
    if (records.length === 0) return 0;

    const dates = records.map((r: any) => new Date(r.date).getTime());
    const minDate = Math.min(...dates);
    const maxDate = Math.max(...dates);
    const daysSpan = (maxDate - minDate) / (1000 * 60 * 60 * 24);

    return Math.max(1, Math.ceil(daysSpan / 7));
  }

  /**
   * Calcula la tendencia mensual basada en las últimas 4 semanas
   */
  private static calculateMonthlyTrend(records: any[]): string {
    if (records.length < 2) return 'stable';

    try {
      const temporalTrends = calculateTemporalTrends(records, 4);

      if (temporalTrends.length < 2) return 'stable';

      // Obtener las últimas 2 semanas con datos
      const recentTrends = temporalTrends.slice(-2);

      if (recentTrends.length < 2) return 'stable';

      const [week1, week2] = recentTrends;

      // Calcular tendencia basada en volumen promedio por sesión
      const avgVolume1 = week1.workouts > 0 ? week1.volume / week1.workouts : 0;
      const avgVolume2 = week2.workouts > 0 ? week2.volume / week2.workouts : 0;

      const changePercent = avgVolume1 > 0 ? ((avgVolume2 - avgVolume1) / avgVolume1) * 100 : 0;

      if (changePercent > 10) return 'increasing';
      if (changePercent < -10) return 'decreasing';
      return 'stable';
    } catch (error) {
      console.error('Error calculando tendencia mensual:', error);
      return 'stable';
    }
  }

  /**
   * Calcula los grupos musculares trabajados en un día específico
   */
  private static calculateMuscleGroupsByDay(dayRecords: any[]): string[] {
    if (dayRecords.length === 0) return [];

    const muscleGroups = new Set<string>();

    dayRecords.forEach((record: any) => {
      if (record.exercise?.categories) {
        record.exercise.categories.forEach((category: string) => {
          muscleGroups.add(category);
        });
      } else if (record.exerciseId) {
        const category = getCategoryFromExercise(record.exerciseId);
        if (category) {
          muscleGroups.add(category);
        }
      }
    });

    return Array.from(muscleGroups);
  }

  /**
   * Genera datos de días de entrenamiento
   */
  private static generateTrainingDaysData(records: any[], exercises: any[]) {
    const daysOfWeek = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
    const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

    return daysOfWeek.map((dayOfWeek, index) => {
      const dayRecords = records.filter((record: any) => {
        const recordDate = new Date(record.date);
        const dayName = recordDate.toLocaleDateString('es-ES', { weekday: 'long' });
        return dayName.toLowerCase() === dayOfWeek;
      });

      const totalVolume = dayRecords.reduce((sum: number, record: any) =>
        sum + calculateVolume(record), 0);

      const exercisesByDay = exercises.filter((exercise: any) => {
        return dayRecords.some((record: any) => record.exerciseId === exercise.id);
      });

      return {
        dayOfWeek,
        dayName: dayNames[index],
        totalWorkouts: dayRecords.length,
        totalVolume,
        exercises: exercisesByDay.map((exercise: any) => ({
          exerciseName: exercise.name,
          categories: exercise.categories || [],
          totalVolume: dayRecords
            .filter((record: any) => record.exerciseId === exercise.id)
            .reduce((sum: number, record: any) => sum + calculateVolume(record), 0),
          workoutCount: dayRecords.filter((record: any) => record.exerciseId === exercise.id).length,
          averageWeight: dayRecords
            .filter((record: any) => record.exerciseId === exercise.id)
            .reduce((sum: number, record: any) => sum + record.weight, 0) /
            Math.max(1, dayRecords.filter((record: any) => record.exerciseId === exercise.id).length),
          maxWeight: Math.max(...dayRecords
            .filter((record: any) => record.exerciseId === exercise.id)
            .map((record: any) => record.weight), 0),
          lastWorkout: dayRecords
            .filter((record: any) => record.exerciseId === exercise.id)
            .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]?.date || '',
          weights: dayRecords
            .filter((record: any) => record.exerciseId === exercise.id)
            .map((record: any) => record.weight)
            .slice(-6), // Últimos 6 pesos
        })),
        muscleGroups: this.calculateMuscleGroupsByDay(dayRecords),
      };
    });
  }

  /**
   * Genera datos de evolución de ejercicios
   */
  private static generateExercisesEvolutionData(records: any[], exercises: any[]) {
    return exercises.map((exercise: any) => {
      const exerciseRecords = records.filter((record: any) => record.exerciseId === exercise.id);
      const sortedRecords = exerciseRecords.sort((a: any, b: any) =>
        new Date(a.date).getTime() - new Date(b.date).getTime());

      const totalVolume = exerciseRecords.reduce((sum: number, record: any) =>
        sum + calculateVolume(record), 0);

      const sessions = sortedRecords.map((record: any, index: number) => ({
        date: new Date(record.date).toLocaleDateString('es-ES'),
        weight: record.weight,
        reps: record.reps,
        sets: record.sets,
        volume: calculateVolume(record),
        estimated1RM: record.weight * (1 + record.reps / 30),
        weekNumber: Math.floor(index / 7) + 1,
      }));

      const firstWeight = sessions[0]?.weight || 0;
      const lastWeight = sessions[sessions.length - 1]?.weight || 0;
      const progressPercentage = firstWeight > 0 ? ((lastWeight - firstWeight) / firstWeight) * 100 : 0;

      return {
        exerciseName: exercise.name,
        categories: exercise.categories || [],
        totalVolume,
        totalWorkouts: exerciseRecords.length,
        sessions,
        evolution: {
          firstWeight,
          lastWeight,
          maxWeight: Math.max(...exerciseRecords.map((r: any) => r.weight), 0),
          progressPercentage,
          averageWeight: exerciseRecords.reduce((sum: number, record: any) => sum + record.weight, 0) / Math.max(1, exerciseRecords.length),
          weightProgression: sessions.map((session, index) => ({
            week: session.weekNumber,
            averageWeight: session.weight,
            maxWeight: session.weight,
          })),
        },
      };
    });
  }

  /**
   * Genera un resumen de contexto desde datos reales del usuario
   */
  static generateContextSummary(context: Awaited<ReturnType<typeof this.getUserContext>>): string {
    const { exportData } = context;

    const summary = `
CONTEXTO DEL USUARIO (DATOS REALES - SISTEMA UNIFICADO):

📊 ESTADÍSTICAS GENERALES:
- Total de ejercicios: ${exportData.metadata.totalExercises}
- Total de entrenamientos: ${exportData.metadata.totalWorkouts}
- Volumen total: ${exportData.metadata.totalVolume.toLocaleString()} kg
- Rango de fechas: ${exportData.metadata.dateRange.from} - ${exportData.metadata.dateRange.to}

⚠️ IMPORTANTE: Si no hay datos de entrenamientos, el usuario no ha registrado entrenamientos aún.

🏋️ EJERCICIOS DISPONIBLES:
${exportData.trainingDays.flatMap((day: any) =>
      day.exercises.map((ex: any) => `- ${ex.exerciseName} (${ex.categories.join(', ')})`)
    ).join('\n')}

📅 RUTINA SEMANAL:
${exportData.trainingDays.map((day: any) =>
      `${day.dayOfWeek}: ${day.exercises.length} ejercicios - ${day.exercises.map((ex: any) => ex.exerciseName).join(', ')}`
    ).join('\n')}

🎯 CATEGORÍAS DE EJERCICIOS:
${Array.from(new Set(exportData.trainingDays.flatMap((day: any) =>
      day.exercises.flatMap((ex: any) => ex.categories)
    ))).join(', ')}

📈 ÚLTIMOS ENTRENAMIENTOS (últimos 5 días):
${(() => {
        // Obtener todos los entrenamientos de los últimos 5 días
        const allSessions = exportData.exercisesEvolution
          .flatMap((ex: any) => ex.sessions.map((session: any) => ({
            exerciseName: ex.exerciseName,
            ...session
          })))
          .sort((a: any, b: any) => {
            // Ordenar por fecha (más reciente primero)
            const dateA = new Date(a.date.split('/').reverse().join('-'));
            const dateB = new Date(b.date.split('/').reverse().join('-'));
            return dateB.getTime() - dateA.getTime();
          })
          .slice(0, 10); // Mostrar hasta 10 entrenamientos más recientes

        if (allSessions.length === 0) {
          return 'No hay entrenamientos registrados recientemente.';
        }

        return allSessions.map((session: any) =>
          `- ${session.exerciseName}: ${session.weight}kg x ${session.reps} reps (${session.sets} sets) - ${session.date}`
        ).join('\n');
      })()}

📅 ENTRENAMIENTOS POR DÍA (última semana):
${exportData.trainingDays.map((day: any) => {
        if (day.totalWorkouts === 0) return null;
        return `${day.dayName}: ${day.totalWorkouts} entrenamientos - ${day.exercises.map((ex: any) => ex.exerciseName).join(', ')}`;
      }).filter(Boolean).join('\n') || 'No hay entrenamientos registrados en la última semana.'}

📅 ENTRENAMIENTOS DE AYER:
${(() => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayDayName = yesterday.toLocaleDateString('es-ES', { weekday: 'long' });
        const yesterdayData = exportData.trainingDays.find((day: any) =>
          day.dayName.toLowerCase() === yesterdayDayName.toLowerCase()
        );

        if (!yesterdayData || yesterdayData.totalWorkouts === 0) {
          return 'No hay entrenamientos registrados ayer.';
        }

        return `${yesterdayData.dayName}: ${yesterdayData.totalWorkouts} entrenamientos - ${yesterdayData.exercises.map((ex: any) =>
          `${ex.exerciseName} (${ex.totalVolume}kg volumen)`
        ).join(', ')}`;
      })()}

💪 PROGRESO POR DÍA:
${exportData.trainingDays.map((day: any) =>
        `${day.dayOfWeek}: ${day.totalWorkouts} entrenamientos, ${day.totalVolume.toLocaleString()} kg volumen`
      ).join('\n')}

📊 ANÁLISIS DE GRUPOS MUSCULARES (SISTEMA UNIFICADO):
${exportData.muscleGroupAnalysis.comparison.map((comp: any) =>
        `- ${comp.group}: ${comp.actualPercentage.toFixed(1)}% (objetivo: ${comp.targetPercentage}%) - ${comp.status}`
      ).join('\n')}

🎯 BALANCE DE RENDIMIENTO (SISTEMA UNIFICADO):
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
          dateRange: { from: '', to: '' },
          appVersion: '1.0.0'
        },
        trainingDays: [],
        exercisesEvolution: [],
        muscleGroupAnalysis: {
          totalVolume: 0,
          definedPercentages: Object.entries(IDEAL_VOLUME_DISTRIBUTION).map(([group, targetPercentage]) => ({
            group,
            targetPercentage,
          })),
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