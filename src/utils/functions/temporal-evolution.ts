import { calculateDayMetrics } from './day-metrics';
import { clamp, roundToDecimals } from './math-utils';
import { calculateTemporalTrends } from './temporal-trends';
import type { TemporalEvolution } from './trends-interfaces';

import type { WorkoutRecord } from '@/interfaces';

/**
 * Calcula análisis temporal completo con evolución avanzada
 */
export const calculateTemporalEvolution = (records: WorkoutRecord[]): TemporalEvolution => {
  const trends = calculateTemporalTrends(records);

  if (trends.length === 0) {
    return {
      trends: [],
      overallTrend: 'Estable',
      growthRate: 0,
      volatility: 0,
      predictions: {
        nextWeekVolume: 0,
        nextWeekWorkouts: 0,
        confidence: 0,
        trend: 'Lateral',
      },
      cycles: {
        hasWeeklyCycle: false,
        peakDay: 'N/A',
        lowDay: 'N/A',
        cyclePeriod: 0,
      },
      milestones: {
        bestWeek: null,
        worstWeek: null,
        mostConsistentWeek: null,
        biggestImprovement: null,
      },
      periodComparisons: {
        last4Weeks: { volume: 0, workouts: 0, avgWeight: 0 },
        previous4Weeks: { volume: 0, workouts: 0, avgWeight: 0 },
        improvement: { volume: 0, workouts: 0, avgWeight: 0 },
      },
      insights: [],
      warnings: [],
    };
  }

  // **CORRECCIÓN CLAVE**: Calcular tendencia usando volumen promedio por sesión
  const firstWeek = trends[0];
  const lastWeek = trends[trends.length - 1];

  // Calcular volumen promedio por sesión para comparación justa
  const firstWeekAvgVolume = firstWeek.workouts > 0 ? firstWeek.volume / firstWeek.workouts : 0;
  const lastWeekAvgVolume = lastWeek.workouts > 0 ? lastWeek.volume / lastWeek.workouts : 0;

  const avgVolumeGrowth = lastWeekAvgVolume - firstWeekAvgVolume;
  const overallTrend = avgVolumeGrowth > 0 ? 'Mejorando' : avgVolumeGrowth < 0 ? 'Declinando' : 'Estable';

  // Calcular tasa de crecimiento promedio por sesión (no dividir por trends.length)
  const growthRate = firstWeekAvgVolume > 0 ? ((avgVolumeGrowth / firstWeekAvgVolume) * 100) : 0;

  // Calcular volatilidad (desviación estándar de cambios porcentuales)
  const changes = trends.slice(1).map(t => t.volumeChangePercent);
  const avgChange = changes.reduce((sum, change) => sum + change, 0) / changes.length;
  const volatility = Math.sqrt(changes.reduce((sum, change) => sum + Math.pow(change - avgChange, 2), 0) / changes.length) / 100;

  // Predicciones simples basadas en tendencia
  const recentTrends = trends.slice(-3);
  const avgRecentVolume = recentTrends.reduce((sum, t) => sum + t.volume, 0) / recentTrends.length;
  const avgRecentWorkouts = recentTrends.reduce((sum, t) => sum + t.workouts, 0) / recentTrends.length;

  // Calcular predicciones
  const predictions = {
    nextWeekVolume: Math.round(avgRecentVolume * (1 + growthRate / 100)),
    nextWeekWorkouts: Math.round(avgRecentWorkouts * (1 + growthRate / 100)),
    confidence: clamp(0.7 - volatility, 0.3, 0.9),
    trend: (growthRate > 5 ? 'Alcista' : growthRate < -5 ? 'Bajista' : 'Lateral'),
  };

  // Análisis de ciclos (usando análisis de días existente)
  const dayMetrics = calculateDayMetrics(records);
  const sortedDays = [...dayMetrics].sort((a, b) => b.totalVolume - a.totalVolume);
  const cycles = {
    hasWeeklyCycle: dayMetrics.some(d => d.workouts > 0),
    peakDay: sortedDays[0]?.dayName || 'N/A',
    lowDay: sortedDays[sortedDays.length - 1]?.dayName || 'N/A',
    cyclePeriod: 7, // Ciclo semanal
  };

  // Encontrar hitos
  const bestWeek = trends.reduce((best, current) =>
    current.performanceScore > best.performanceScore ? current : best,
  );
  const worstWeek = trends.reduce((worst, current) =>
    current.performanceScore < worst.performanceScore ? current : worst,
  );
  const mostConsistentWeek = trends.reduce((most, current) =>
    current.consistency > most.consistency ? current : most,
  );
  const biggestImprovement = trends.reduce((biggest, current) =>
    current.volumeChangePercent > biggest.volumeChangePercent ? current : biggest,
  );

  // Comparaciones por períodos
  const last4Weeks = trends.slice(-4);
  const previous4Weeks = trends.slice(-8, -4);

  // **CORRECCIÓN CLAVE**: Calcular volumen promedio por sesión para comparación justa
  const last4WeeksStats = {
    volume: last4Weeks.reduce((sum, t) => sum + t.volume, 0),
    workouts: last4Weeks.reduce((sum, t) => sum + t.workouts, 0),
    avgWeight: roundToDecimals(last4Weeks.reduce((sum, t) => sum + t.avgWeight, 0) / last4Weeks.length),
  };

  const previous4WeeksStats = {
    volume: previous4Weeks.reduce((sum, t) => sum + t.volume, 0),
    workouts: previous4Weeks.reduce((sum, t) => sum + t.workouts, 0),
    avgWeight: previous4Weeks.length > 0 ? roundToDecimals(previous4Weeks.reduce((sum, t) => sum + t.avgWeight, 0) / previous4Weeks.length) : 0,
  };

  const improvement = {
    volume: last4WeeksStats.volume - previous4WeeksStats.volume,
    workouts: last4WeeksStats.workouts - previous4WeeksStats.workouts,
    avgWeight: roundToDecimals((last4WeeksStats.avgWeight - previous4WeeksStats.avgWeight)),
  };

  // Generar insights
  const insights: string[] = [];
  if (overallTrend === 'Mejorando') {
    insights.push(`Tu volumen ha crecido un ${Math.round(growthRate * 100)}% por semana`);
  }
  if (bestWeek.performanceScore > 80) {
    insights.push(`Tu mejor semana fue la del ${bestWeek.period} con ${bestWeek.volume}kg`);
  }
  if (improvement.volume > 0) {
    insights.push(`Has mejorado ${improvement.volume}kg en promedio vs las 4 semanas anteriores`);
  }
  if (volatility < 0.2) {
    insights.push('Tu entrenamiento muestra consistencia muy estable');
  }
  if (predictions.trend === 'Alcista') {
    insights.push('Las predicciones indican un crecimiento continuo');
  }

  // Generar advertencias
  const warnings: string[] = [];
  if (volatility > 0.5) {
    warnings.push('Tu rendimiento muestra alta volatilidad');
  }
  if (overallTrend === 'Declinando') {
    warnings.push('Tu volumen de entrenamiento está declinando');
  }
  if (improvement.volume < -500) {
    warnings.push('Has tenido una caída significativa vs el período anterior');
  }
  if (predictions.confidence < 0.5) {
    warnings.push('Las predicciones tienen baja confianza debido a inconsistencias');
  }

  return {
    trends,
    overallTrend,
    growthRate: roundToDecimals(growthRate),
    volatility: roundToDecimals(volatility),
    predictions,
    cycles,
    milestones: {
      bestWeek,
      worstWeek,
      mostConsistentWeek,
      biggestImprovement,
    },
    periodComparisons: {
      last4Weeks: last4WeeksStats,
      previous4Weeks: previous4WeeksStats,
      improvement,
    },
    insights,
    warnings,
  };
};
