import { calculateBalanceConsistency } from './calculate-balance-consistency';
import { calculateVolumeProgression } from './calculate-volume-progression';
import { analyzeTrendTowardsIdeal, calculateWeeklyBalancePercentages } from './calculate-weekly-balance-percentages';
import { calculateWeightProgression } from './calculate-weight-progression';

import { IDEAL_VOLUME_DISTRIBUTION } from '@/constants';
import type { ExerciseAssignment, WorkoutRecord } from '@/interfaces';

/**
 * Analiza el historial de balance para un grupo muscular
 * Actualizado para medir consistencia real de balance, no solo fuerza
 */
export const analyzeBalanceHistory = (
  categoryRecords: WorkoutRecord[],
  allRecords?: WorkoutRecord[],
  allAssignments?: ExerciseAssignment[],
  customVolumeDistribution?: Record<string, number>
): {
  trend: 'improving' | 'stable' | 'declining';
  consistency: number;
  volatility: number;
} => {
  if (categoryRecords.length < 3) {
    return { trend: 'stable', consistency: 0, volatility: 0 };
  }

  // Si tenemos todos los registros, usar análisis de balance real
  if (allRecords && allRecords.length >= categoryRecords.length) {
    const balanceConsistency = calculateBalanceConsistency(categoryRecords, allRecords);
    const weeklyBalanceData = calculateWeeklyBalancePercentages(categoryRecords, allRecords);

    if (weeklyBalanceData.length >= 3) {
      // Analizar tendencia de balance (se acerca o aleja del ideal)
      const category = categoryRecords[0]?.exercise?.categories?.[0] || '';
      const idealPercentage = customVolumeDistribution?.[category] || IDEAL_VOLUME_DISTRIBUTION[category] || 15;
      const trendTowardsIdeal = analyzeTrendTowardsIdeal(weeklyBalanceData, idealPercentage);

      // **MEJORA**: Verificar progreso de fuerza y volumen también en el camino principal
      const volumeProgression = calculateVolumeProgression(categoryRecords);
      const weightProgression = calculateWeightProgression(categoryRecords, undefined, allAssignments);

      let trend: 'improving' | 'stable' | 'declining';

      // **PRIORIDAD**: Si hay progreso significativo, es improving
      if (weightProgression > 5 || volumeProgression > 10) {
        trend = 'improving';
      } else if (trendTowardsIdeal > 0.05) {
        trend = 'improving';
      } else if (trendTowardsIdeal < -0.5) {
        // **VERIFICACIÓN**: Si hay progreso de volumen, ser más tolerante
        if (volumeProgression > 0) {
          trend = 'stable';
        } else {
          trend = 'declining';
        }
      } else {
        trend = 'stable';
      }

      // Calcular volatilidad del balance (variabilidad en porcentajes semanales)
      const percentages = weeklyBalanceData.map(w => w.percentage);
      const avgPercentage = percentages.reduce((sum, p) => sum + p, 0) / percentages.length;
      const variance = percentages.reduce((sum, p) => sum + Math.pow(p - avgPercentage, 2), 0) / percentages.length;
      const stdDev = Math.sqrt(variance);
      const volatility = avgPercentage > 0 ? (stdDev / avgPercentage) * 100 : 0;

      return {
        trend,
        consistency: Math.round(balanceConsistency),
        volatility: Math.round(Math.min(100, volatility)),
      };
    }
  }

  // **FALLBACK**: Si no hay suficientes datos para análisis de balance real,
  // usar análisis de progreso de fuerza como proxy
  const sortedRecords = [...categoryRecords].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  // Dividir en dos períodos para análisis de tendencia
  const midpoint = Math.floor(sortedRecords.length / 2);
  const firstHalf = sortedRecords.slice(0, midpoint);
  const secondHalf = sortedRecords.slice(midpoint);

  if (firstHalf.length === 0 || secondHalf.length === 0) {
    return { trend: 'stable', consistency: 0, volatility: 0 };
  }

  // Calcular progreso promedio de 1RM entre períodos
  const firstHalfAvg1RM = firstHalf.reduce((sum, r) => {
    return sum + (r.weight * (1 + Math.min(r.reps, 20) / 30));
  }, 0) / firstHalf.length;

  const secondHalfAvg1RM = secondHalf.reduce((sum, r) => {
    return sum + (r.weight * (1 + Math.min(r.reps, 20) / 30));
  }, 0) / secondHalf.length;

  // Calcular cambio de tendencia
  const trendChange = firstHalfAvg1RM > 0 ? ((secondHalfAvg1RM - firstHalfAvg1RM) / firstHalfAvg1RM) * 100 : 0;

  // Umbrales para determinar tendencia
  const improvingThreshold = 2; // 2% de mejora
  const decliningThreshold = -5; // 5% de declive

  let trend: 'improving' | 'stable' | 'declining';

  if (trendChange > improvingThreshold) {
    trend = 'improving';
  } else if (trendChange < decliningThreshold) {
    trend = 'declining';
  } else {
    trend = 'stable';
  }

  // Calcular consistencia de progreso (no de balance, pero mejor que nada)
  const oneRMs = sortedRecords.map(r => r.weight * (1 + Math.min(r.reps, 20) / 30));
  const mean = oneRMs.reduce((sum, v) => sum + v, 0) / oneRMs.length;
  const variance = oneRMs.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / oneRMs.length;
  const stdDev = Math.sqrt(variance);
  const consistency = mean > 0 ? Math.max(0, 100 - ((stdDev / mean) * 100)) : 0;

  // **MEJORA**: Calcular volatilidad más tolerante también en el fallback
  const rawVolatility = mean > 0 ? (stdDev / mean) * 100 : 0;

  // Reducir volatilidad cuando hay pocos datos
  const recordsCount = sortedRecords.length;
  let adjustedVolatility = rawVolatility;

  if (recordsCount < 10) {
    adjustedVolatility = rawVolatility * 0.5; // 50% del valor original
  } else if (recordsCount < 20) {
    adjustedVolatility = rawVolatility * 0.7; // 70% del valor original
  }

  return {
    trend,
    consistency: Math.round(consistency),
    volatility: Math.round(Math.min(100, adjustedVolatility)),
  };
};
