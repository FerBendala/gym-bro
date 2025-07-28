import type { WorkoutRecord } from '@/interfaces';
import { calculateTotalGrowth, formatNumberToString } from '@/utils';
import { startOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import { useMemo } from 'react';

/**
 * Interfaz para los datos de timeline del historial
 */
interface HistoryPoint {
  date: Date;
  value: number;
  label: string;
  details: string;
  weekNumber: number;
  totalWorkouts: number;
  avgWeight: number;
  maxWeight: number;
  totalSets: number;
  totalReps: number;
  uniqueExercises: number;
  change: number;
  changePercent: number;
  totalVolumeChangePercent: number;
  trend: 'up' | 'down' | 'stable';
}

/**
 * Hook personalizado para procesar datos de historial
 */
export const useHistoryData = (records: WorkoutRecord[]) => {
  const historyData = useMemo((): HistoryPoint[] => {
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

    // Convertir a historial points con comparativas
    const sortedData = Array.from(weeklyData.entries())
      .map(([weekKey, data]) => ({
        date: new Date(weekKey),
        value: data.totalVolume,
        label: `${formatNumberToString(data.totalVolume)} kg`,
        details: `${data.workouts} entrenamientos • Fuerza promedio: ${formatNumberToString(data.avgWeight)} kg (1RM est.)`,
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

    // **CORRECCIÓN CLAVE**: Calcular cambios usando volumen promedio por sesión
    return sortedData.map((point, index) => {
      const weekNumber = index + 1;
      let change = 0;
      let changePercent = 0;
      let totalVolumeChangePercent = 0;
      let trend: 'up' | 'down' | 'stable' = 'stable';

      if (index > 0) {
        const previousPoint = sortedData[index - 1];

        // CORRECCIÓN: Comparación justa temporal - mismo punto en ambas semanas
        const now = new Date();
        const currentWeekStart = startOfWeek(point.date, { locale: es });
        const isCurrentWeekIncomplete = point.date.getTime() >= startOfWeek(now, { locale: es }).getTime();

        let currentAvgVolume: number;
        let previousAvgVolume: number;

        if (isCurrentWeekIncomplete) {
          // SEMANA ACTUAL INCOMPLETA: Comparar solo hasta el mismo día de la semana
          const dayOfWeekToCompare = now.getDay(); // 0=domingo, 1=lunes, etc.

          // Obtener registros de semana actual hasta el día actual
          const currentWeekRecords = records.filter(r => {
            const rDate = new Date(r.date);
            const rWeekStart = startOfWeek(rDate, { locale: es });
            const dayOfRecord = rDate.getDay();
            return rWeekStart.getTime() === currentWeekStart.getTime() &&
              dayOfRecord <= dayOfWeekToCompare;
          });

          // Obtener registros de semana anterior hasta el mismo día de la semana
          const previousWeekStart = startOfWeek(previousPoint.date, { locale: es });
          const previousWeekRecords = records.filter(r => {
            const rDate = new Date(r.date);
            const rWeekStart = startOfWeek(rDate, { locale: es });
            const dayOfRecord = rDate.getDay();
            return rWeekStart.getTime() === previousWeekStart.getTime() &&
              dayOfRecord <= dayOfWeekToCompare;
          });

          const currentPartialVolume = currentWeekRecords.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0);
          const previousPartialVolume = previousWeekRecords.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0);

          currentAvgVolume = currentWeekRecords.length > 0 ? currentPartialVolume / currentWeekRecords.length : 0;
          previousAvgVolume = previousWeekRecords.length > 0 ? previousPartialVolume / previousWeekRecords.length : 0;
        } else {
          // SEMANA COMPLETA: Comparación normal
          currentAvgVolume = point.totalWorkouts > 0 ? point.value / point.totalWorkouts : 0;
          previousAvgVolume = previousPoint.totalWorkouts > 0 ? previousPoint.value / previousPoint.totalWorkouts : 0;
        }

        // **CORRECCIÓN**: Calcular tanto cambio por sesión como volumen total
        const currentTotalVolume = point.value;
        const previousTotalVolume = previousPoint.value;

        // Cambio en volumen promedio por sesión
        change = Math.round(currentAvgVolume - previousAvgVolume);
        changePercent = previousAvgVolume > 0 ? ((currentAvgVolume - previousAvgVolume) / previousAvgVolume) * 100 : 0;

        // Cambio en volumen total para referencia
        totalVolumeChangePercent = previousTotalVolume > 0 ? ((currentTotalVolume - previousTotalVolume) / previousTotalVolume) * 100 : 0;

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
        totalVolumeChangePercent: index > 0 ? totalVolumeChangePercent : 0,
        trend
      };
    });
  }, [records]);

  // **FUNCIÓN UNIFICADA**: Usar la función utilitaria para calcular crecimiento
  const { percentGrowth: totalGrowthPercent } = calculateTotalGrowth(historyData);

  return {
    historyData,
    totalGrowthPercent
  };
}; 