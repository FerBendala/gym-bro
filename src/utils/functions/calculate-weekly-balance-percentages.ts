import type { WorkoutRecord } from '@/interfaces';
import { calculateCategoryEffortDistribution } from './exercise-patterns';

/**
 * Calcula porcentajes de volumen por semana para análisis de balance
 */
export const calculateWeeklyBalancePercentages = (categoryRecords: WorkoutRecord[], allRecords: WorkoutRecord[]) => {
  const weeklyData: Record<string, { categoryVolume: number; totalVolume: number }> = {};

  // Agrupar todos los registros por semana
  allRecords.forEach(record => {
    const date = new Date(record.date);
    const monday = new Date(date);
    monday.setDate(date.getDate() - date.getDay() + 1);
    const weekKey = monday.toISOString().split('T')[0];

    if (!weeklyData[weekKey]) {
      weeklyData[weekKey] = { categoryVolume: 0, totalVolume: 0 };
    }

    const recordVolume = record.weight * record.reps * record.sets;
    weeklyData[weekKey].totalVolume += recordVolume;

    // Si es de la categoría específica, añadir al volumen de categoría
    const recordCategories = record.exercise?.categories || [];
    const targetCategory = categoryRecords[0]?.exercise?.categories?.[0];
    if (recordCategories.includes(targetCategory || '')) {
      // Usar distribución de esfuerzo si es multi-categoría
      const effortDistribution = calculateCategoryEffortDistribution(recordCategories);
      const categoryEffort = effortDistribution[targetCategory || ''] || 1;
      weeklyData[weekKey].categoryVolume += recordVolume * categoryEffort;
    }
  });

  // Convertir a array con porcentajes
  return Object.entries(weeklyData)
    .filter(([, data]) => data.totalVolume > 0)
    .map(([week, data]) => ({
      week,
      percentage: (data.categoryVolume / data.totalVolume) * 100,
      categoryVolume: data.categoryVolume,
      totalVolume: data.totalVolume
    }))
    .sort((a, b) => a.week.localeCompare(b.week));
};

/**
 * Analiza la tendencia hacia el balance ideal
 */
export const analyzeTrendTowardsIdeal = (weeklyData: Array<{ percentage: number }>, idealPercentage: number): number => {
  if (weeklyData.length < 3) return 0;

  const midpoint = Math.floor(weeklyData.length / 2);
  const firstHalf = weeklyData.slice(0, midpoint);
  const secondHalf = weeklyData.slice(midpoint);

  const firstHalfAvg = firstHalf.reduce((sum, w) => sum + w.percentage, 0) / firstHalf.length;
  const secondHalfAvg = secondHalf.reduce((sum, w) => sum + w.percentage, 0) / secondHalf.length;

  // Calcular si se acerca al ideal
  const firstDeviation = Math.abs(firstHalfAvg - idealPercentage);
  const secondDeviation = Math.abs(secondHalfAvg - idealPercentage);

  // Retorna valor entre -1 (se aleja del ideal) y 1 (se acerca al ideal)
  return firstDeviation > 0 ? (firstDeviation - secondDeviation) / firstDeviation : 0;
}; 