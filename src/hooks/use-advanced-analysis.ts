import type { WorkoutRecord } from '@/interfaces';
import { calculateAdvancedAnalysis, calculateTrendsAnalysis } from '@/utils';
import { useMemo } from 'react';

/**
 * Hook centralizado para análisis avanzado
 * Evita duplicación de cálculos en múltiples componentes
 * Patrón usado en +4 archivos: useMemo(() => calculateAdvancedAnalysis(records), [records])
 */
export const useAdvancedAnalysis = (records: WorkoutRecord[]) => {
  return useMemo(() => calculateAdvancedAnalysis(records), [records]);
};

/**
 * Hook centralizado para análisis de tendencias
 * Evita duplicación de cálculos en componentes de tendencias
 */
export const useTrendsAnalysis = (records: WorkoutRecord[]) => {
  return useMemo(() => calculateTrendsAnalysis(records), [records]);
};

/**
 * Hook centralizado para análisis de ejercicios
 * Evita duplicación de cálculos en componentes de analytics
 */
export const useExerciseAnalysis = (records: WorkoutRecord[]) => {
  return useMemo(() => {
    if (records.length === 0) return [];

    // Filtrar registros válidos con información de ejercicio
    const validRecords = records.filter(record =>
      record.exercise && record.exercise.name && record.exercise.name !== 'Ejercicio desconocido'
    );

    // Agrupar por ejercicio
    const exerciseMap = new Map<string, WorkoutRecord[]>();
    validRecords.forEach(record => {
      const exerciseName = record.exercise.name;
      if (!exerciseMap.has(exerciseName)) {
        exerciseMap.set(exerciseName, []);
      }
      exerciseMap.get(exerciseName)!.push(record);
    });

    // Calcular métricas por ejercicio
    return Array.from(exerciseMap.entries()).map(([exerciseName, exerciseRecords]) => {
      const totalVolume = exerciseRecords.reduce((sum, record) =>
        sum + (record.weight * record.reps * record.sets), 0
      );

      const weights = exerciseRecords.map(r => r.weight);
      const avgWeight = weights.length > 0 ? weights.reduce((sum, w) => sum + w, 0) / weights.length : 0;
      const maxWeight = weights.length > 0 ? Math.max(...weights) : 0;

      const firstRecord = exerciseRecords[0];
      const lastRecord = exerciseRecords[exerciseRecords.length - 1];
      const progress = lastRecord.weight - firstRecord.weight;
      const progressPercent = firstRecord.weight > 0 ? (progress / firstRecord.weight) * 100 : 0;

      return {
        name: exerciseName,
        totalVolume,
        avgWeight,
        maxWeight,
        records: exerciseRecords.length,
        firstWeight: firstRecord.weight,
        lastWeight: lastRecord.weight,
        progress,
        progressPercent
      };
    }).sort((a, b) => b.totalVolume - a.totalVolume);
  }, [records]);
};