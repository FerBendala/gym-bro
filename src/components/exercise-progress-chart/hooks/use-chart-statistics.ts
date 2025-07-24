import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useMemo } from 'react';
import type { WorkoutRecord } from '../../../interfaces';
import type { ChartStatistics } from '../types';

/**
 * Hook para calcular estadísticas adicionales del gráfico de progreso
 */
export const useChartStatistics = (records: WorkoutRecord[]): ChartStatistics => {
  return useMemo(() => {
    if (records.length === 0) {
      return {
        totalExercises: 0,
        totalSessions: 0,
        averageWeightIncrease: 0,
        bestProgress: { exercise: 'N/A', improvement: 0 },
        consistencyScore: 0,
        timeRange: 'Sin datos'
      };
    }

    // Agrupar por ejercicio
    const exerciseGroups = records.reduce((acc, record) => {
      const exerciseName = record.exercise?.name || 'Ejercicio desconocido';
      if (!acc[exerciseName]) {
        acc[exerciseName] = [];
      }
      acc[exerciseName].push(record);
      return acc;
    }, {} as Record<string, WorkoutRecord[]>);

    // Calcular estadísticas básicas
    const totalExercises = Object.keys(exerciseGroups).length;
    const totalSessions = records.length;

    // Calcular progreso por ejercicio considerando peso y repeticiones
    const exerciseProgress = Object.entries(exerciseGroups).map(([exerciseName, exerciseRecords]) => {
      const sortedRecords = [...exerciseRecords].sort((a, b) => a.date.getTime() - b.date.getTime());

      // CORREGIDO: Solo calcular progreso si hay al menos 2 registros
      if (sortedRecords.length < 2) {
        return {
          exercise: exerciseName,
          improvement: 0,
          hasProgress: false,
          recordCount: sortedRecords.length
        };
      }

      const firstRecord = sortedRecords[0];
      const lastRecord = sortedRecords[sortedRecords.length - 1];

      // Calcular 1RM estimado para mejor comparación de progreso
      const first1RM = firstRecord.weight * (1 + Math.min(firstRecord.reps, 20) / 30);
      const last1RM = lastRecord.weight * (1 + Math.min(lastRecord.reps, 20) / 30);
      const improvement = last1RM - first1RM;

      return {
        exercise: exerciseName,
        improvement,
        hasProgress: improvement > 0,
        recordCount: sortedRecords.length
      };
    });

    // Progreso promedio (ahora considera peso y repeticiones)
    const averageWeightIncrease = exerciseProgress.reduce((sum, ep) => sum + ep.improvement, 0) / exerciseProgress.length;

    // Mejor progreso
    const bestProgress = exerciseProgress.reduce((best, current) =>
      current.improvement > best.improvement ? current : best
      , { exercise: 'N/A', improvement: 0 });

    // Puntuación de consistencia (% de ejercicios con progreso positivo)
    const exercisesWithProgress = exerciseProgress.filter(ep => ep.hasProgress).length;
    const consistencyScore = Math.round((exercisesWithProgress / exerciseProgress.length) * 100);

    // Rango de tiempo
    const sortedDates = [...records].sort((a, b) => a.date.getTime() - b.date.getTime());
    const firstDate = sortedDates[0].date;

    const timeRange = records.length > 1
      ? formatDistanceToNow(firstDate, { locale: es, addSuffix: false })
      : 'Datos insuficientes';

    return {
      totalExercises,
      totalSessions,
      averageWeightIncrease: Number(averageWeightIncrease.toFixed(1)),
      bestProgress: {
        exercise: bestProgress.exercise,
        improvement: Number(bestProgress.improvement.toFixed(1))
      },
      consistencyScore,
      timeRange
    };
  }, [records]);
}; 