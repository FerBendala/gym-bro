import type { WorkoutRecord } from '@/interfaces';
import { endOfWeek, format, getDay, startOfWeek, subWeeks } from 'date-fns';
import { es } from 'date-fns/locale';
import { roundToDecimals } from './math-utils';
import type { TemporalTrend } from './trends-interfaces';
import { getMaxWeight } from './workout-utils';

/**
 * Calcula tendencias temporales mejoradas por semana
 */
export const calculateTemporalTrends = (records: WorkoutRecord[], weeksCount: number = 12): TemporalTrend[] => {
  if (records.length === 0) return [];

  const now = new Date();
  const trends: TemporalTrend[] = [];

  for (let i = 0; i < weeksCount; i++) {
    const weekStart = startOfWeek(subWeeks(now, i), { locale: es });
    const weekEnd = endOfWeek(weekStart, { locale: es });

    const weekRecords = records.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= weekStart && recordDate <= weekEnd;
    });

    if (weekRecords.length > 0) {
      const totalVolume = weekRecords.reduce((sum, record) =>
        sum + (record.weight * record.reps * record.sets), 0
      );

      const weights = weekRecords.map(record => record.weight);
      const avgWeight = weights.length > 0 ? weights.reduce((sum, w) => sum + w, 0) / weights.length : 0;
      const maxWeight = getMaxWeight(records);

      // Calcular métricas adicionales
      const uniqueExercises = new Set(weekRecords.map(r => r.exerciseId)).size;
      const totalReps = weekRecords.reduce((sum, r) => sum + r.reps, 0);
      const totalSets = weekRecords.reduce((sum, r) => sum + r.sets, 0);
      const avgReps = totalReps / weekRecords.length;
      const avgSets = totalSets / weekRecords.length;

      // Calcular consistencia de la semana (distribución de entrenamientos)
      const dailyWorkouts = Array(7).fill(0);
      weekRecords.forEach(record => {
        const dayIndex = getDay(new Date(record.date));
        dailyWorkouts[dayIndex]++;
      });
      const workoutDays = dailyWorkouts.filter(count => count > 0).length;
      const consistency = Math.round((workoutDays / 7) * 100);

      // Calcular fuerza promedio (peso promedio ponderado por volumen)
      const weeklyStrength = avgWeight > 0 ? avgWeight * (1 + Math.min(avgReps, 20) / 30) : 0;

      const trend: TemporalTrend = {
        period: format(weekStart, 'dd/MM', { locale: es }),
        fullDate: format(weekStart, 'yyyy-MM-dd', { locale: es }),
        workouts: weekRecords.length,
        volume: Math.round(totalVolume),
        avgWeight: roundToDecimals(avgWeight),
        maxWeight: roundToDecimals(maxWeight),
        weekNumber: weeksCount - i,
        volumeChange: 0, // Se calculará después
        volumeChangePercent: 0, // Se calculará después
        workoutChange: 0, // Se calculará después
        consistency,
        momentum: 'Estable', // Se calculará después
        performanceScore: 0, // Se calculará después
        uniqueExercises,
        avgReps: roundToDecimals(avgReps),
        avgSets: roundToDecimals(avgSets),
        totalSets,
        weeklyStrength: roundToDecimals(weeklyStrength)
      };

      trends.push(trend);
    }
  }

  // Ordenar por fecha (más antiguo primero)
  trends.sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime());

  // **CORRECCIÓN CLAVE**: Calcular cambios usando volumen promedio por sesión
  for (let i = 1; i < trends.length; i++) {
    const current = trends[i];
    const previous = trends[i - 1];

    // Calcular volumen promedio por sesión para comparación justa
    const currentAvgVolume = current.workouts > 0 ? current.volume / current.workouts : 0;
    const previousAvgVolume = previous.workouts > 0 ? previous.volume / previous.workouts : 0;

    // Cambio absoluto en volumen promedio por sesión
    current.volumeChange = Math.round(currentAvgVolume - previousAvgVolume);

    // Cambio porcentual basado en volumen promedio por sesión
    current.volumeChangePercent = previousAvgVolume > 0 ?
      Math.round(((currentAvgVolume - previousAvgVolume) / previousAvgVolume) * 100) : 0;

    current.workoutChange = current.workouts - previous.workouts;

    // **CORRECCIÓN CLAVE**: Calcular momentum usando volumen promedio por sesión
    if (i >= 2) {
      const trend1 = trends[i - 2];
      const trend2 = trends[i - 1];
      const trend3 = trends[i];

      const avgVolume1 = trend1.workouts > 0 ? trend1.volume / trend1.workouts : 0;
      const avgVolume2 = trend2.workouts > 0 ? trend2.volume / trend2.workouts : 0;
      const avgVolume3 = trend3.workouts > 0 ? trend3.volume / trend3.workouts : 0;

      const change1 = avgVolume2 - avgVolume1;
      const change2 = avgVolume3 - avgVolume2;

      if (change1 > 0 && change2 > 0) current.momentum = 'Creciente';
      else if (change1 < 0 && change2 < 0) current.momentum = 'Decreciente';
      else current.momentum = 'Estable';
    }

    // Calcular performance score (0-100)
    const volumeScore = Math.min(100, (current.volume / 10000) * 100);
    const consistencyScore = current.consistency;
    const varietyScore = Math.min(100, (current.uniqueExercises / 10) * 100);
    current.performanceScore = Math.round((volumeScore + consistencyScore + varietyScore) / 3);
  }

  return trends.slice(-8); // Últimas 8 semanas con datos
}; 