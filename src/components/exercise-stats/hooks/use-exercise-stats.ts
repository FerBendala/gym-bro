import type { WorkoutRecord } from '@/interfaces';
import {
  calculateAverage,
  calculateMax,
  calculateMostFrequent,
  countUniqueBy,
  findMostRecent,
  formatDateForComparison
} from '@/utils';
import { useMemo } from 'react';
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

    // Filtrar registros válidos con información de ejercicio (igual que en analytics)
    const validRecords = records.filter(record =>
      record.exercise && record.exercise.name && record.exercise.name !== 'Ejercicio desconocido'
    );

    // Total de entrenamientos (usar validRecords para consistencia)
    const totalWorkouts = validRecords.length;

    // Volumen total (peso × reps × series) - usar validRecords para consistencia
    const totalVolume = validRecords.reduce((sum, record) =>
      sum + (record.weight * record.reps * record.sets), 0
    );

    // Peso promedio usando utilidad genérica - usar validRecords para consistencia
    const weights = validRecords.map(record => record.weight);
    const averageWeight = weights.length > 0 ? calculateAverage(weights) : 0;

    // Peso máximo usando utilidad genérica - usar validRecords para consistencia
    const maxWeight = weights.length > 0 ? calculateMax(weights) : 0;

    // Días únicos de entrenamiento usando utilidad genérica - usar validRecords para consistencia
    const workoutDays = countUniqueBy(validRecords, record => formatDateForComparison(record.date));

    // Último entrenamiento usando utilidad genérica - usar validRecords para consistencia
    const lastWorkout = validRecords.length > 0 ? findMostRecent(validRecords)?.date || null : null;

    // Ejercicio más frecuente usando utilidad genérica - usar validRecords para consistencia
    const exerciseNames = validRecords
      .map(record => record.exercise?.name || 'Ejercicio desconocido')
      .filter(name => name !== 'Ejercicio desconocido');

    const mostFrequentExercise = exerciseNames.length > 0 ? calculateMostFrequent(exerciseNames) : null;

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