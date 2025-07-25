import type { WorkoutRecord } from '@/interfaces';
import { startOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import { useMemo } from 'react';
import { calculateTotalGrowth, formatNumber } from '../../../utils/functions';

/**
 * Interfaz extendida para datos de timeline con comparativas
 */
export interface ExtendedTimelinePoint {
  date: Date;
  value: number;
  label: string;
  details?: string;
  weekNumber: number;
  totalWorkouts: number;
  avgWeight: number;
  maxWeight: number;
  totalSets: number;
  totalReps: number;
  uniqueExercises: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
}

/**
 * Hook para calcular datos de timeline
 */
export const useTimelineData = (records: WorkoutRecord[]) => {
  const timelineData = useMemo((): ExtendedTimelinePoint[] => {
    if (records.length === 0) return [];

    // Agrupar por semanas usando date-fns con locale español (lunes a domingo)
    const weeklyData = new Map<string, {
      totalVolume: number;
      avgWeight: number;
      workouts: number;
      maxWeight: number;
      totalSets: number;
      totalReps: number;
      exercises: Set<string>;
      weekStart: Date;
    }>();

    records.forEach(record => {
      const date = new Date(record.date);
      // Usar startOfWeek con locale español para consistencia con el resto del código
      const weekStart = startOfWeek(date, { locale: es }); // Lunes como inicio de semana
      const weekKey = weekStart.toISOString().split('T')[0];

      const volume = record.weight * record.reps * record.sets;
      const estimated1RM = record.weight * (1 + Math.min(record.reps, 20) / 30);

      if (!weeklyData.has(weekKey)) {
        weeklyData.set(weekKey, {
          totalVolume: 0,
          avgWeight: 0,
          workouts: 0,
          maxWeight: 0,
          totalSets: 0,
          totalReps: 0,
          exercises: new Set(),
          weekStart
        });
      }

      const week = weeklyData.get(weekKey)!;
      week.totalVolume += volume;
      // Usar 1RM estimado para el promedio de fuerza
      week.avgWeight = (week.avgWeight * week.workouts + estimated1RM) / (week.workouts + 1);
      week.maxWeight = Math.max(week.maxWeight, record.weight);
      week.totalSets += record.sets;
      week.totalReps += record.reps;
      week.workouts += 1;

      if (record.exercise?.name) {
        week.exercises.add(record.exercise.name);
      }
    });

    // Convertir a timeline points con comparativas
    const sortedData = Array.from(weeklyData.entries())
      .map(([weekKey, data]) => ({
        date: new Date(weekKey),
        value: data.totalVolume,
        label: `${formatNumber(data.totalVolume)} kg`,
        details: `${data.workouts} entrenamientos • Fuerza promedio: ${formatNumber(data.avgWeight)} kg (1RM est.)`,
        weekNumber: 0, // Se calculará después
        totalWorkouts: data.workouts,
        avgWeight: data.avgWeight,
        maxWeight: data.maxWeight,
        totalSets: data.totalSets,
        totalReps: data.totalReps,
        uniqueExercises: data.exercises.size,
        change: 0,
        changePercent: 0,
        trend: 'stable' as const
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    // Calcular cambios y tendencias - Usar volumen promedio por sesión
    return sortedData.map((point, index) => {
      const weekNumber = index + 1;
      let change = 0;
      let changePercent = 0;
      let trend: 'up' | 'down' | 'stable' = 'stable';

      if (index > 0) {
        const previousPoint = sortedData[index - 1];

        // Usar volumen promedio por sesión para comparación justa
        const currentAvgVolume = point.totalWorkouts > 0 ? point.value / point.totalWorkouts : 0;
        const previousAvgVolume = previousPoint.totalWorkouts > 0 ? previousPoint.value / previousPoint.totalWorkouts : 0;

        // Cambio en volumen promedio por sesión
        change = Math.round(currentAvgVolume - previousAvgVolume);
        changePercent = previousAvgVolume > 0 ? ((currentAvgVolume - previousAvgVolume) / previousAvgVolume) * 100 : 0;

        if (Math.abs(changePercent) < 5) {
          trend = 'stable';
        } else if (changePercent > 0) {
          trend = 'up';
        } else {
          trend = 'down';
        }
      }

      return {
        ...point,
        weekNumber,
        change,
        changePercent,
        trend
      };
    });
  }, [records]);

  const maxValue = Math.max(...timelineData.map(point => point.value));

  // Usar la función utilitaria para calcular crecimiento
  const { percentGrowth: totalGrowthPercent } = calculateTotalGrowth(timelineData);

  return {
    timelineData,
    maxValue,
    totalGrowthPercent
  };
}; 