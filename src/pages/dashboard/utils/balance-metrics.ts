import { clamp } from '@/utils/functions/math-utils';
import type { ProcessedUserData, WeeklyData } from './balance-types';

/**
 * Calcula métricas globales optimizadas usando datos pre-procesados
 * @param processedData - Datos procesados en una sola pasada
 * @returns Métricas globales de consistencia, intensidad y frecuencia
 */
export const calculateOptimizedGlobalMetrics = (processedData: ProcessedUserData) => {
  const { weeklyWorkouts, exerciseMaxWeights, totalVolume, totalWorkouts } = processedData;

  // Calcular consistencia
  const totalWeeks = weeklyWorkouts.size;
  const totalWorkoutDays = Array.from(weeklyWorkouts.values()).reduce((sum, days) => sum + days.size, 0);
  const avgWorkoutDaysPerWeek = totalWeeks > 0 ? totalWorkoutDays / totalWeeks : 0;
  const targetDaysPerWeek = 3;
  const consistency = clamp((avgWorkoutDaysPerWeek / targetDaysPerWeek) * 100, 0, 100);

  // Calcular intensidad ponderada por volumen
  const maxWeights = Array.from(exerciseMaxWeights.values());
  if (maxWeights.length === 0) {
    return { consistency, intensity: 0, frequency: 0 };
  }

  const totalMaxWeight = maxWeights.reduce((sum, weight) => sum + weight, 0);
  const avgMaxWeight = totalMaxWeight / maxWeights.length;
  const avgWeight = totalWorkouts > 0 ? totalVolume / totalWorkouts : 0;
  const intensity = avgMaxWeight > 0 ? clamp((avgWeight / avgMaxWeight) * 100, 0, 100) : 0;

  // Calcular frecuencia
  const totalSessions = Array.from(weeklyWorkouts.values()).reduce((sum, sessions) => sum + sessions.size, 0);
  const avgSessionsPerWeek = totalWeeks > 0 ? totalSessions / totalWeeks : 0;
  const frequency = clamp((avgSessionsPerWeek / 3) * 100, 0, 100);

  return { consistency, intensity, frequency };
};

/**
 * Calcula volumen mensual (actual o anterior)
 * @param weeklyData - Datos semanales
 * @param period - 'current' o 'previous'
 * @returns Volumen total del mes
 */
export const calculateMonthlyVolume = (weeklyData: WeeklyData[], period: 'current' | 'previous'): number => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const targetMonth = period === 'current' ? currentMonth : (currentMonth === 0 ? 11 : currentMonth - 1);
  const targetYear = period === 'current' ? currentYear : (currentMonth === 0 ? currentYear - 1 : currentYear);

  return weeklyData
    .filter(week => {
      const weekDate = new Date(week.weekStart);
      return weekDate.getMonth() === targetMonth && weekDate.getFullYear() === targetYear;
    })
    .reduce((sum, week) => sum + week.volume, 0);
};

/**
 * Calcula sesiones por encima del promedio
 * @param weeklyData - Datos semanales
 * @param averageVolume - Volumen promedio por sesión
 * @returns Número de sesiones por encima del promedio
 */
export const calculateSessionsAboveAverage = (weeklyData: WeeklyData[], averageVolume: number): number => {
  return weeklyData.filter(week => week.volume > averageVolume).length;
};
