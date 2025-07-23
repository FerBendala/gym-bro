import { useMemo } from 'react';
import type { WorkoutRecord } from '../../../interfaces';
import { calculateWeightProgress } from '../../../utils/functions';
import type { AnalyticsMetric } from '../types';

/**
 * Hook para calcular métricas de analytics
 */
export const useAnalyticsMetrics = (records: WorkoutRecord[]) => {
  const metrics = useMemo((): AnalyticsMetric[] => {
    if (records.length === 0) return [];

    // Filtrar registros válidos con información de ejercicio
    const validRecords = records.filter(record =>
      record.exercise && record.exercise.name && record.exercise.name !== 'Ejercicio desconocido'
    );

    // Calcular métricas principales
    const totalVolume = validRecords.reduce((sum, record) =>
      sum + (record.weight * record.reps * record.sets), 0
    );

    const totalWorkouts = validRecords.length;

    // Calcular ejercicios únicos usando el nombre del ejercicio
    const uniqueExercises = new Set(
      validRecords
        .filter(r => r.exercise?.name)
        .map(r => r.exercise!.name)
    ).size;

    // Calcular promedio de peso
    const averageWeight = validRecords.length > 0
      ? validRecords.reduce((sum, record) => sum + record.weight, 0) / validRecords.length
      : 0;

    // Calcular días únicos de entrenamiento
    const uniqueDays = new Set(validRecords.map(r => r.date.toDateString())).size;

    // Calcular frecuencia semanal - Agrupar por semanas y calcular promedio
    const weeklyData = new Map<string, Set<string>>();

    validRecords.forEach(record => {
      const date = new Date(record.date);
      // Obtener el lunes de la semana
      const monday = new Date(date);
      monday.setDate(date.getDate() - date.getDay() + 1);
      const weekKey = monday.toISOString().split('T')[0];

      if (!weeklyData.has(weekKey)) {
        weeklyData.set(weekKey, new Set());
      }
      weeklyData.get(weekKey)!.add(record.date.toDateString());
    });

    // Calcular promedio de días por semana solo para semanas con entrenamientos
    const weeklyFrequency = weeklyData.size > 0
      ? Array.from(weeklyData.values()).reduce((sum, daysSet) => sum + daysSet.size, 0) / weeklyData.size
      : 0;

    // Usar la función utilitaria para calcular progreso de peso
    const { absoluteProgress: weightProgress, percentProgress: weightProgressPercent } = calculateWeightProgress(validRecords);

    return [
      {
        id: 'total-volume',
        name: 'Volumen Total',
        value: totalVolume,
        unit: 'kg',
        trend: 'up',
        trendValue: 0,
        description: 'Suma total de peso levantado en todos los entrenamientos',
        color: 'blue'
      },
      {
        id: 'total-workouts',
        name: 'Total Entrenamientos',
        value: totalWorkouts,
        unit: '',
        trend: 'up',
        trendValue: 0,
        description: 'Número total de entrenamientos registrados',
        color: 'green'
      },
      {
        id: 'unique-exercises',
        name: 'Ejercicios Únicos',
        value: uniqueExercises,
        unit: '',
        trend: 'stable',
        trendValue: 0,
        description: 'Variedad de ejercicios diferentes realizados',
        color: 'purple'
      },
      {
        id: 'average-weight',
        name: 'Fuerza Promedio',
        value: averageWeight,
        unit: 'kg',
        trend: weightProgress > 0 ? 'up' : weightProgress < 0 ? 'down' : 'stable',
        trendValue: weightProgressPercent,
        description: 'Progreso de fuerza considerando peso y repeticiones',
        color: 'yellow'
      },
      {
        id: 'training-days',
        name: 'Días Entrenados',
        value: uniqueDays,
        unit: '',
        trend: 'up',
        trendValue: 0,
        description: 'Número de días únicos con entrenamientos',
        color: 'indigo'
      },
      {
        id: 'weekly-frequency',
        name: 'Frecuencia Semanal',
        value: weeklyFrequency,
        unit: 'días/sem',
        trend: weeklyFrequency >= 3 ? 'up' : weeklyFrequency >= 2 ? 'stable' : 'down',
        trendValue: 0,
        description: 'Promedio de días de entrenamiento por semana',
        color: 'teal'
      }
    ];
  }, [records]);

  return { metrics };
}; 