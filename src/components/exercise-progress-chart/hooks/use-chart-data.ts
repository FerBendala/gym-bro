import { useMemo } from 'react';
import { THEME_CHART } from '../../../constants/theme';
import type { WorkoutRecord } from '../../../interfaces';
import { calculateDataRange, groupRecordsByProperty, sortRecordsByDate } from '../../../utils/functions';
import type { ProcessedChartData, UseChartDataReturn } from '../types';

/**
 * Hook específico para procesar datos del ExerciseProgressChart
 * Maneja agrupación, ordenamiento y cálculo de rangos de datos
 */
export const useChartData = (records: WorkoutRecord[]): UseChartDataReturn => {
  const chartData = useMemo((): ProcessedChartData | null => {
    if (records.length === 0) {
      return null;
    }

    // Agrupar por ejercicio
    const exerciseData = groupRecordsByProperty(
      records,
      (record) => record.exercise?.name || 'Ejercicio desconocido'
    );

    // Ordenar cada ejercicio por fecha
    Object.keys(exerciseData).forEach(exercise => {
      exerciseData[exercise] = sortRecordsByDate(exerciseData[exercise]);
    });

    // Calcular rangos de datos usando 1RM estimado para mostrar progreso real
    const all1RMs = records.map(r => r.weight * (1 + Math.min(r.reps, 20) / 30));
    const weightRange = calculateDataRange(all1RMs);

    const allDates = records.map(r => r.date.getTime());
    const dateRange = calculateDataRange(allDates);

    // Crear elementos de leyenda
    const legendItems = Object.keys(exerciseData).map((exerciseName, index) => ({
      label: exerciseName,
      color: THEME_CHART.colors[index % THEME_CHART.colors.length]
    }));

    return {
      exerciseData,
      weightRange,
      dateRange,
      legendItems
    };
  }, [records]);

  return {
    chartData,
    isEmpty: !chartData || records.length === 0
  };
}; 