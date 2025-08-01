import type { WorkoutRecord } from '@/interfaces';
import { analyzeMuscleBalance, calculateBalanceScore, calculateCategoryAnalysis } from '@/utils';
import { generateCategoryRecommendations, generateCategoryWarnings } from '@/utils/functions/generate-category-recommendations';
import { isValidRecord } from '@/utils/functions/is-valid-record.utils';
import { calculateCategoryWeeklyData, processUserDataInSinglePass } from './balance-data-processor';
import { calculateMonthlyVolume, calculateOptimizedGlobalMetrics, calculateSessionsAboveAverage } from './balance-metrics';
import type { BalanceAnalysisResult } from './balance-types';
import { calculateUpperLowerBalance } from './balance-upper-lower';

/**
 * Función principal para calcular análisis de balance muscular
 * @param records - Registros de entrenamiento
 * @returns Análisis completo de balance con métricas globales y por categoría
 */
export const calculateBalanceAnalysis = (records: WorkoutRecord[]): BalanceAnalysisResult => {
  try {
    if (records.length === 0) {
      return getEmptyBalanceAnalysis();
    }

    // Validar que los datos sean consistentes usando utils generales
    const validRecords = records.filter(isValidRecord);
    if (validRecords.length === 0) {
      return getEmptyBalanceAnalysis();
    }

    // Procesar todos los datos en una sola pasada para optimizar performance
    const processedData = processUserDataInSinglePass(validRecords);

    // Usar las funciones correctas de category-analysis
    const categoryAnalysis = calculateCategoryAnalysis(validRecords);
    const muscleBalance = analyzeMuscleBalance(validRecords);
    const balanceScore = calculateBalanceScore(muscleBalance);

    // Calcular balance superior/inferior
    const upperLowerBalance = calculateUpperLowerBalance(categoryAnalysis.categoryMetrics);

    // Calcular métricas globales optimizadas
    const { consistency, intensity, frequency } = calculateOptimizedGlobalMetrics(processedData);

    // Calcular datos semanales reales para cada categoría
    const categoryWeeklyData = calculateCategoryWeeklyData(validRecords, processedData);

    return {
      balanceScore,
      finalConsistency: consistency,
      avgIntensity: intensity,
      avgFrequency: frequency,
      muscleBalance: muscleBalance.map(balance => ({
        ...balance,
        totalVolume: balance.volume,
        personalRecords: categoryWeeklyData.get(balance.category)?.personalRecords ? [{
          id: `pr_${balance.category}`,
          weight: categoryWeeklyData.get(balance.category)?.personalRecords || 0,
          reps: 1,
          date: categoryWeeklyData.get(balance.category)?.lastWorkout || new Date(),
          exerciseId: `${balance.category}_exercise`,
        }] : [],
        balanceHistory: {
          ...balance.balanceHistory,
          weeklyData: categoryWeeklyData.get(balance.category)?.weeklyData.map(w => ({
            week: w.weekStart,
            volume: w.volume,
            percentage: w.volume > 0 ? (w.volume / (categoryWeeklyData.get(balance.category)?.currentWeekVolume || 1)) * 100 : 0,
          })) || [],
          lastWeekVolume: categoryWeeklyData.get(balance.category)?.lastWeekVolume || 0,
          currentWeekVolume: categoryWeeklyData.get(balance.category)?.currentWeekVolume || 0,
          changePercent: categoryWeeklyData.get(balance.category)?.changePercent || 0,
        },
      })),
      categoryAnalysis: {
        categoryMetrics: categoryAnalysis.categoryMetrics.map(metric => {
          const weeklyData = categoryWeeklyData.get(metric.category);
          return {
            ...metric,
            lastWorkout: weeklyData?.lastWorkout || null,
            totalSets: metric.avgSets * metric.workouts,
            totalReps: metric.avgReps * metric.workouts,
            personalRecords: weeklyData?.personalRecords || 0,
            daysSinceLastWorkout: weeklyData?.daysSinceLastWorkout || 0,
            trend: metric.weightProgression > 0 ? 'improving' : 'stable',
            strengthLevel: metric.estimatedOneRM > 100 ? 'advanced' : metric.estimatedOneRM > 50 ? 'intermediate' : 'beginner',
            recentImprovement: metric.weightProgression > 0,
            volumeDistribution: {
              thisWeek: weeklyData?.currentWeekVolume || 0,
              lastWeek: weeklyData?.lastWeekVolume || 0,
              thisMonth: calculateMonthlyVolume(weeklyData?.weeklyData || [], 'current'),
              lastMonth: calculateMonthlyVolume(weeklyData?.weeklyData || [], 'previous'),
            },
            performanceMetrics: {
              bestSession: {
                date: weeklyData?.lastWorkout || new Date(),
                volume: metric.totalVolume,
                maxWeight: metric.maxWeight,
              },
              averageSessionVolume: metric.totalVolume / Math.max(1, metric.workouts),
              volumePerWorkout: metric.totalVolume / Math.max(1, metric.workouts),
              sessionsAboveAverage: calculateSessionsAboveAverage(weeklyData?.weeklyData || [], metric.totalVolume / Math.max(1, metric.workouts)),
            },
            recommendations: generateCategoryRecommendations(metric.category, {
              consistencyScore: metric.consistencyScore,
              intensityScore: metric.intensityScore,
              weightProgression: metric.weightProgression,
              avgWorkoutsPerWeek: metric.avgWorkoutsPerWeek,
              strengthLevel: metric.estimatedOneRM > 100 ? 'advanced' : metric.estimatedOneRM > 50 ? 'intermediate' : 'beginner',
              workouts: metric.workouts,
              daysSinceLastWorkout: weeklyData?.daysSinceLastWorkout || 0,
              trend: metric.weightProgression > 0 ? 'improving' : 'stable',
            }),
            warnings: generateCategoryWarnings(metric.category, {
              consistencyScore: metric.consistencyScore,
              weightProgression: metric.weightProgression,
              daysSinceLastWorkout: weeklyData?.daysSinceLastWorkout || 0,
              trend: metric.weightProgression < -10 ? 'declining' : 'stable',
              avgWorkoutsPerWeek: metric.avgWorkoutsPerWeek,
            }),
            volumeTrend: metric.volumeProgression,
            frequency: metric.avgWorkoutsPerWeek,
            intensity: metric.intensityScore,
          };
        }),
        overallBalance: balanceScore,
        recommendations: generateOverallRecommendations(balanceScore, consistency, intensity, frequency),
      },
      upperLowerBalance,
      selectedView: 'general' as const,
    };
  } catch (error) {
    // Usar un logger apropiado en lugar de console.error
    // eslint-disable-next-line no-console
    console.error('Error en cálculo de balance:', error);
    return getEmptyBalanceAnalysis();
  }
};

/**
 * Retorna análisis de balance vacío para casos edge
 * @returns Análisis de balance con valores por defecto
 */
const getEmptyBalanceAnalysis = () => ({
  balanceScore: 0,
  finalConsistency: 0,
  avgIntensity: 0,
  avgFrequency: 0,
  muscleBalance: [],
  categoryAnalysis: {
    categoryMetrics: [],
    overallBalance: 0,
    recommendations: [],
  },
  upperLowerBalance: {
    upperBody: { volume: 0, percentage: 0, categories: [] },
    lowerBody: { volume: 0, percentage: 0, categories: [] },
    core: { volume: 0, percentage: 0, categories: [] },
    isBalanced: true,
    recommendation: 'Sin datos suficientes',
  },
  selectedView: 'general' as const,
});

/**
 * Genera recomendaciones generales basadas en métricas globales
 * @param balanceScore - Score de balance
 * @param consistency - Consistencia global
 * @param intensity - Intensidad global
 * @param frequency - Frecuencia global
 * @returns Array de recomendaciones generales
 */
const generateOverallRecommendations = (balanceScore: number, consistency: number, intensity: number, frequency: number): string[] => {
  const recommendations: string[] = [];

  if (balanceScore < 60) {
    recommendations.push('Considera equilibrar mejor el entrenamiento entre grupos musculares');
  }

  if (consistency < 70) {
    recommendations.push('Mejora la consistencia de entrenamiento para mejores resultados');
  }

  if (intensity < 60) {
    recommendations.push('Aumenta progresivamente la intensidad de tus entrenamientos');
  }

  if (frequency < 70) {
    recommendations.push('Aumenta la frecuencia de entrenamiento a 3+ sesiones por semana');
  }

  return recommendations;
};
