import type { WorkoutRecord } from '@/interfaces';
import { groupRecordsByWeek, isSameWeek } from './group-records-by-week';
import { clamp } from './math-utils';

/**
 * Calcula la consistencia específica del balance muscular
 * Mide qué tan estable se mantiene la distribución de volumen de una categoría
 */
export const calculateBalanceConsistency = (
  categoryRecords: WorkoutRecord[],
  allRecords: WorkoutRecord[]
): number => {
  if (categoryRecords.length === 0 || allRecords.length === 0) return 0;

  // Agrupar por semanas
  const weeklyData = groupRecordsByWeek(allRecords);
  const categoryWeeklyData = groupRecordsByWeek(categoryRecords);

  // Necesitamos mínimo 4-5 semanas para una medición confiable
  if (weeklyData.length < 4) return 0;

  // Calcular % de volumen de esta categoría cada semana
  const weeklyPercentages = weeklyData.map(week => {
    const weekTotalVolume = week.reduce((sum, record) => sum + (record.weight * record.reps), 0);
    const categoryVolume = categoryWeeklyData
      .find(catWeek => isSameWeek(catWeek[0]?.date.toString(), week[0]?.date.toString()))
      ?.reduce((sum, record) => sum + (record.weight * record.reps), 0) || 0;

    return weekTotalVolume > 0 ? (categoryVolume / weekTotalVolume) * 100 : 0;
  });

  // Calcular desviación estándar
  const mean = weeklyPercentages.reduce((sum, val) => sum + val, 0) / weeklyPercentages.length;
  const variance = weeklyPercentages.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / weeklyPercentages.length;
  const stdDev = Math.sqrt(variance);

  // Calcular score de consistencia (0-100)
  const maxAcceptableStdDev = 0.5; // Desviación estándar máxima aceptable
  const score = clamp(100 - (stdDev / maxAcceptableStdDev) * 100, 0, 100);

  return score;
}; 