import { differenceInDays, format } from 'date-fns';
import type { WorkoutRecord } from '../../interfaces';

/**
 * Utilidades genéricas para cálculos estadísticos y formateo
 * Reutilizable en ExerciseStats, Dashboard, Analytics, etc.
 */

/**
 * Formatea un número con el formato español y decimales opcionales
 */
export const formatNumber = (num: number, maxDecimals: number = 1): string => {
  return new Intl.NumberFormat('es-ES', {
    maximumFractionDigits: maxDecimals
  }).format(num);
};

/**
 * Calcula el promedio de un array de números
 */
export const calculateAverage = (numbers: number[]): number => {
  if (numbers.length === 0) return 0;
  return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
};

/**
 * Calcula el máximo de un array de números
 */
export const calculateMax = (numbers: number[]): number => {
  if (numbers.length === 0) return 0;
  return Math.max(...numbers);
};

/**
 * Calcula el mínimo de un array de números
 */
export const calculateMin = (numbers: number[]): number => {
  if (numbers.length === 0) return 0;
  return Math.min(...numbers);
};

/**
 * Calcula el elemento más frecuente en un array
 */
export const calculateMostFrequent = <T>(items: T[]): T | null => {
  if (items.length === 0) return null;

  const frequency = items.reduce((acc, item) => {
    const key = String(item);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const mostFrequent = Object.entries(frequency)
    .sort(([, a], [, b]) => b - a)[0];

  return mostFrequent ? (items.find(item => String(item) === mostFrequent[0]) || null) : null;
};

/**
 * Cuenta elementos únicos en un array basado en una función de mapeo
 */
export const countUniqueBy = <T>(items: T[], mapFn: (item: T) => string): number => {
  const uniqueValues = new Set(items.map(mapFn));
  return uniqueValues.size;
};

/**
 * Calcula días transcurridos desde una fecha
 */
export const getDaysAgo = (date: Date | null): string | null => {
  if (!date) return null;

  const days = differenceInDays(new Date(), date);
  if (days === 0) return 'Hoy';
  if (days === 1) return 'Ayer';
  return `Hace ${days} días`;
};

/**
 * Formatea una fecha como string para comparaciones
 */
export const formatDateForComparison = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

/**
 * Encuentra el registro más reciente en un array basado en fecha
 */
export const findMostRecent = <T extends { date: Date }>(records: T[]): T | null => {
  if (records.length === 0) return null;

  return records.reduce((most, current) =>
    current.date.getTime() > most.date.getTime() ? current : most
  );
};

/**
 * Calcula estadísticas básicas de una serie de números
 */
export const calculateBasicStats = (values: number[]) => {
  if (values.length === 0) {
    return { avg: 0, min: 0, max: 0, total: 0, count: 0 };
  }

  const total = values.reduce((sum, val) => sum + val, 0);
  const avg = total / values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);

  return { avg, min, max, total, count: values.length };
};

/**
 * Encuentra el valor más común en una serie
 */
export const findMostCommon = <T>(values: T[]): T | null => {
  if (values.length === 0) return null;

  const frequency = new Map<T, number>();
  values.forEach(val => {
    frequency.set(val, (frequency.get(val) || 0) + 1);
  });

  return Array.from(frequency.entries())
    .reduce((a, b) => a[1] > b[1] ? a : b)[0];
};

/**
 * Calcula el percentil especificado
 */
export const calculatePercentile = (values: number[], percentile: number): number => {
  if (values.length === 0) return 0;

  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
};

/**
 * Calcula el volumen de un entrenamiento (peso × reps × sets)
 * Si tiene series individuales, calcula el volumen exacto por serie
 */
export const calculateWorkoutVolume = (record: WorkoutRecord): number => {
  // Si tiene series individuales, calcular volumen exacto
  if (record.individualSets && record.individualSets.length > 0) {
    return record.individualSets.reduce((total, set) => {
      return total + (set.weight * set.reps);
    }, 0);
  }

  // Fallback al cálculo tradicional
  return record.weight * record.reps * record.sets;
};

/**
 * Calcula el volumen total de una lista de entrenamientos
 */
export const calculateTotalVolume = (records: WorkoutRecord[]): number => {
  return records.reduce((total, record) => total + calculateWorkoutVolume(record), 0);
};

/**
 * Calcula la intensidad promedio (peso promedio) de una lista de entrenamientos
 */
export const calculateAverageIntensity = (records: WorkoutRecord[]): number => {
  if (records.length === 0) return 0;
  const weights = records.map(record => record.weight);
  return calculateAverage(weights);
};

/**
 * Calcula el número total de repeticiones
 */
export const calculateTotalReps = (records: WorkoutRecord[]): number => {
  return records.reduce((total, record) => total + (record.reps * record.sets), 0);
};

/**
 * Calcula el número total de series
 */
export const calculateTotalSets = (records: WorkoutRecord[]): number => {
  return records.reduce((total, record) => total + record.sets, 0);
};

/**
 * Clasifica el volumen de entrenamiento en categorías
 */
export const classifyVolumeLevel = (volume: number): 'bajo' | 'moderado' | 'alto' | 'muy_alto' | 'extremo' => {
  if (volume < 100) return 'bajo';
  if (volume < 500) return 'moderado';
  if (volume < 1000) return 'alto';
  if (volume < 2000) return 'muy_alto';
  return 'extremo';
};

/**
 * Obtiene el color correspondiente a un nivel de volumen
 */
export const getVolumeColor = (volume: number): string => {
  const level = classifyVolumeLevel(volume);
  const colors = {
    bajo: 'text-gray-400',
    moderado: 'text-blue-400',
    alto: 'text-green-400',
    muy_alto: 'text-yellow-400',
    extremo: 'text-red-400'
  };
  return colors[level];
};

/**
 * Obtiene la etiqueta de texto para un nivel de volumen
 */
export const getVolumeLabel = (volume: number): string => {
  const level = classifyVolumeLevel(volume);
  const labels = {
    bajo: 'Volumen Bajo',
    moderado: 'Volumen Moderado',
    alto: 'Volumen Alto',
    muy_alto: 'Volumen Muy Alto',
    extremo: 'Volumen Extremo'
  };
  return labels[level];
};

/**
 * Calcula el progreso relativo entre dos valores
 */
export const calculateProgress = (oldValue: number, newValue: number): number => {
  if (oldValue === 0) return newValue > 0 ? 100 : 0;
  return ((newValue - oldValue) / oldValue) * 100;
};

/**
 * Formatea un número como volumen (con separadores de miles)
 */
export const formatVolume = (volume: number): string => {
  return volume.toLocaleString('es-ES');
};

/**
 * Formatea la descripción de un entrenamiento mostrando series individuales si están disponibles
 */
export const formatWorkoutDescription = (record: WorkoutRecord): string => {
  // Si tiene series individuales, mostrar detalle por serie
  if (record.individualSets && record.individualSets.length > 0) {
    const seriesTexts = record.individualSets.map((set, index) =>
      `Serie ${index + 1}: ${set.weight}kg × ${set.reps}`
    );
    return seriesTexts.join(', ');
  }

  // Fallback al formato tradicional
  return `${record.weight}kg × ${record.reps} × ${record.sets}`;
};

/**
 * Obtiene el número total de series de un entrenamiento
 */
export const getTotalSets = (record: WorkoutRecord): number => {
  if (record.individualSets && record.individualSets.length > 0) {
    return record.individualSets.length;
  }
  return record.sets;
};

/**
 * Obtiene el número total de repeticiones de un entrenamiento
 */
export const getTotalReps = (record: WorkoutRecord): number => {
  if (record.individualSets && record.individualSets.length > 0) {
    return record.individualSets.reduce((total, set) => total + set.reps, 0);
  }
  return record.reps * record.sets;
}; 