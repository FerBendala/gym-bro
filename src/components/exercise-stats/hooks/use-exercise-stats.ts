import { useMemo } from 'react';
import type { WorkoutRecord } from '../../../interfaces';
import {
  calculateAverage,
  calculateMax,
  calculateMostFrequent,
  countUniqueBy,
  findMostRecent,
  formatDateForComparison
} from '../../../utils/functions';
import type { CalculatedStats, UseExerciseStatsReturn } from '../types';

/**
 * Hook específico para calcular estadísticas del ExerciseStats
 * Maneja todos los cálculos usando utilidades genéricas reutilizables
 */
export const useExerciseStats = (records: WorkoutRecord[]): UseExerciseStatsReturn => {
  const stats = useMemo((): CalculatedStats => {
    if (records.length === 0) {
      return {
        totalWorkouts: 0,
        totalVolume: 0,
        averageWeight: 0,
        maxWeight: 0,
        workoutDays: 0,
        lastWorkout: null,
        mostFrequentExercise: null
      };
    }

    // Total de entrenamientos
    const totalWorkouts = records.length;

    // Volumen total (peso × reps × series)
    const totalVolume = records.reduce((sum, record) =>
      sum + (record.weight * record.reps * record.sets), 0
    );

    // Peso promedio usando utilidad genérica
    const weights = records.map(record => record.weight);
    const averageWeight = calculateAverage(weights);

    // Peso máximo usando utilidad genérica
    const maxWeight = calculateMax(weights);

    // Días únicos de entrenamiento usando utilidad genérica
    const workoutDays = countUniqueBy(records, record => formatDateForComparison(record.date));

    // Último entrenamiento usando utilidad genérica
    const lastWorkout = findMostRecent(records)?.date || null;

    // Ejercicio más frecuente usando utilidad genérica
    const exerciseNames = records
      .map(record => record.exercise?.name || 'Ejercicio desconocido')
      .filter(name => name !== 'Ejercicio desconocido');

    const mostFrequentExercise = calculateMostFrequent(exerciseNames);

    return {
      totalWorkouts,
      totalVolume,
      averageWeight,
      maxWeight,
      workoutDays,
      lastWorkout,
      mostFrequentExercise
    };
  }, [records]);

  return {
    stats,
    isEmpty: records.length === 0
  };
}; 