import type { WorkoutRecord } from '@/interfaces';
import { calculateDayMetrics } from './day-metrics';
import { findBestPerformancePeriod } from './performance-periods';
import { calculateTemporalEvolution } from './temporal-evolution';
import { calculateTemporalTrends } from './temporal-trends';
import type { DayMetrics, TrendsAnalysis } from './trends-interfaces';
import { calculateVolumeTrendByDay } from './volume-trends';
import { analyzeWorkoutHabits } from './workout-habits';

/**
 * Calcula análisis completo de tendencias
 */
export const calculateTrendsAnalysis = (records: WorkoutRecord[]): TrendsAnalysis => {
  return {
    dayMetrics: calculateDayMetrics(records),
    dayMetricsOrdered: getDayMetricsOrderedByWeek(records),
    temporalTrends: calculateTemporalTrends(records),
    temporalEvolution: calculateTemporalEvolution(records),
    workoutHabits: analyzeWorkoutHabits(records),
    volumeTrendByDay: calculateVolumeTrendByDay(records),
    bestPerformancePeriod: findBestPerformancePeriod(records)
  };
};

/**
 * Obtiene métricas ordenadas por día de la semana (Lunes a Domingo)
 */
export const getDayMetricsOrderedByWeek = (records: WorkoutRecord[]): DayMetrics[] => {
  const allMetrics = calculateDayMetrics(records);

  // Crear un mapa por índice de día
  const metricsMap: Record<number, DayMetrics> = {};
  allMetrics.forEach(metric => {
    metricsMap[metric.dayIndex] = metric;
  });

  // Ordenar Lunes (1) a Domingo (0), con Domingo al final
  const weekOrder = [1, 2, 3, 4, 5, 6, 0]; // Lunes a Domingo
  const orderedMetrics: DayMetrics[] = [];

  weekOrder.forEach(dayIndex => {
    if (metricsMap[dayIndex]) {
      orderedMetrics.push(metricsMap[dayIndex]);
    } else {
      // Crear entrada vacía para días sin datos
      const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      orderedMetrics.push({
        dayName: dayNames[dayIndex],
        dayIndex,
        workouts: 0,
        avgVolume: 0,
        totalVolume: 0,
        percentage: 0,
        mostFrequentTime: null,
        maxWeight: 0,
        avgWeight: 0,
        uniqueExercises: 0,
        avgReps: 0,
        avgSets: 0,
        totalSets: 0,
        consistency: 0,
        trend: 0,
        performanceScore: 0,
        topExercise: 'N/A',
        efficiency: 0,
        intensity: 0,
        recommendations: ['Considera añadir entrenamientos en este día']
      });
    }
  });

  return orderedMetrics;
}; 