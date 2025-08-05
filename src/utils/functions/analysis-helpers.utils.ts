import { sortRecordsByDateAscending } from './workout-utils';

import type { WorkoutRecord } from '@/interfaces';

/**
 * Utilidades de análisis centralizadas
 * Optimizado para usar funciones de ordenamiento centralizadas
 */

/**
 * Calcula la tendencia de peso en un período específico
 * MEJORADO: Considera solo semanas completadas para un cálculo más preciso
 */
export const calculateWeightTrend = (records: WorkoutRecord[], days = 30): number => {
  if (records.length < 2) return 0;

  // ✅ OPTIMIZACIÓN: Usar función centralizada de ordenamiento
  const sortedRecords = sortRecordsByDateAscending(records);

  // Si tenemos menos registros que días, usar todos los registros
  const recordsToAnalyze = sortedRecords.slice(-Math.min(days, sortedRecords.length));

  if (recordsToAnalyze.length === 0) return 0;

  // Usar función utilitaria para separar semanas completadas
  const { completedRecords } = separateCompletedWeeksFromCurrent(recordsToAnalyze);

  // Si no hay registros de semanas completadas, usar todos los registros
  const recordsToCompare = completedRecords.length > 0 ? completedRecords : recordsToAnalyze;

  // Dividir en períodos reciente y anterior
  const midPoint = Math.floor(recordsToCompare.length / 2);
  const recentRecords = recordsToCompare.slice(midPoint);
  const olderRecords = recordsToCompare.slice(0, midPoint);

  if (recentRecords.length === 0 || olderRecords.length === 0) return 0;

  const recentAvgWeight = recentRecords.reduce((sum, r) => sum + r.weight, 0) / recentRecords.length;
  const olderAvgWeight = olderRecords.reduce((sum, r) => sum + r.weight, 0) / olderRecords.length;

  return recentAvgWeight - olderAvgWeight;
};

/**
 * Calcula la tendencia de volumen en un período específico
 * MEJORADO: Considera solo semanas completadas para un cálculo más preciso
 */
export const calculateVolumeTrend = (records: WorkoutRecord[], days = 30): number => {
  if (records.length < 2) return 0;

  // ✅ OPTIMIZACIÓN: Usar función centralizada de ordenamiento
  const sortedRecords = sortRecordsByDateAscending(records);

  // Si tenemos menos registros que días, usar todos los registros
  const recordsToAnalyze = sortedRecords.slice(-Math.min(days, sortedRecords.length));

  if (recordsToAnalyze.length === 0) return 0;

  // Usar función utilitaria para separar semanas completadas
  const { completedRecords } = separateCompletedWeeksFromCurrent(recordsToAnalyze);

  // Si no hay registros de semanas completadas, usar todos los registros
  const recordsToCompare = completedRecords.length > 0 ? completedRecords : recordsToAnalyze;

  // Dividir en períodos reciente y anterior
  const midPoint = Math.floor(recordsToCompare.length / 2);
  const recentRecords = recordsToCompare.slice(midPoint);
  const olderRecords = recordsToCompare.slice(0, midPoint);

  if (recentRecords.length === 0 || olderRecords.length === 0) return 0;

  const recentAvgVolume = recentRecords.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0) / recentRecords.length;
  const olderAvgVolume = olderRecords.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0) / olderRecords.length;

  return recentAvgVolume - olderAvgVolume;
};

/**
 * Calcula la frecuencia de entrenamiento en un período específico
 * MEJORADO: Maneja mejor los casos edge y proporciona valores más realistas
 * CORREGIDO: Ahora calcula por semanas en lugar de dividir días únicos por período total
 * CORREGIDO: Ahora cuenta días únicos por semana, no entrenamientos totales
 * MEJORADO: Considera solo semanas completadas para un cálculo más preciso
 */
export const calculateTrainingFrequency = (records: WorkoutRecord[], days = 30): number => {
  if (records.length === 0) return 0;

  const sortedRecords = sortRecordsByDateAscending(records);
  const recordsToAnalyze = sortedRecords.slice(-Math.min(days, sortedRecords.length));

  if (recordsToAnalyze.length === 0) return 0;

  // Agrupar por semanas para calcular frecuencia semanal real
  const weeklyData = new Map<string, Set<string>>();

  recordsToAnalyze.forEach(record => {
    const date = new Date(record.date);
    // Obtener el lunes de la semana (día 1 = lunes)
    const monday = new Date(date);
    monday.setDate(date.getDate() - date.getDay() + 1);
    const weekKey = monday.toISOString().split('T')[0];

    if (!weeklyData.has(weekKey)) {
      weeklyData.set(weekKey, new Set());
    }
    // Usar la fecha como string para contar días únicos
    weeklyData.get(weekKey)!.add(record.date.toDateString());
  });

  // Identificar la semana actual
  const today = new Date();
  const currentMonday = new Date(today);
  currentMonday.setDate(today.getDate() - today.getDay() + 1);
  const currentWeekKey = currentMonday.toISOString().split('T')[0];

  // Calcular frecuencia basada en semanas completadas
  let totalUniqueDays = 0;
  let completedWeeks = 0;

  weeklyData.forEach((daysSet, week) => {
    const isCurrentWeek = week === currentWeekKey;

    if (!isCurrentWeek) {
      // Solo contar semanas completadas (no la semana actual)
      totalUniqueDays += daysSet.size;
      completedWeeks++;
    }
  });

  // Si no hay semanas completadas, usar todas las semanas
  if (completedWeeks === 0) {
    totalUniqueDays = Array.from(weeklyData.values()).reduce((sum, daysSet) => sum + daysSet.size, 0);
    completedWeeks = weeklyData.size;
  }

  const weeklyFrequency = totalUniqueDays > 0 && completedWeeks > 0
    ? totalUniqueDays / completedWeeks
    : 0;

  return weeklyFrequency;
};

/**
 * Calcula ejercicios por semana (nueva función)
 * MEJORADO: Cuenta ejercicios reales, no solo días únicos
 * CORREGIDO: Ahora calcula por semanas en lugar de dividir por período total
 * MEJORADO: Considera solo semanas completadas para un cálculo más preciso
 */
export const calculateExercisesPerWeek = (records: WorkoutRecord[], days = 30): number => {
  if (records.length === 0) return 0;

  // ✅ OPTIMIZACIÓN: Usar función centralizada de ordenamiento
  const sortedRecords = sortRecordsByDateAscending(records);

  // Si tenemos menos registros que días, usar todos los registros
  const recordsToAnalyze = sortedRecords.slice(-Math.min(days, sortedRecords.length));

  if (recordsToAnalyze.length === 0) return 0;

  // Identificar la semana actual
  const today = new Date();
  const currentMonday = new Date(today);
  currentMonday.setDate(today.getDate() - today.getDay() + 1);
  const currentWeekKey = currentMonday.toISOString().split('T')[0];

  // Agrupar por semanas para calcular ejercicios por semana real
  const weeklyData = new Map<string, Set<string>>();

  recordsToAnalyze.forEach(record => {
    const date = new Date(record.date);
    // Obtener el lunes de la semana (día 1 = lunes)
    const monday = new Date(date);
    monday.setDate(date.getDate() - date.getDay() + 1);
    const weekKey = monday.toISOString().split('T')[0];

    if (!weeklyData.has(weekKey)) {
      weeklyData.set(weekKey, new Set());
    }
    weeklyData.get(weekKey)!.add(record.exercise?.name || 'unknown');
  });

  // Calcular ejercicios únicos por semana promedio (solo semanas completadas)
  let totalUniqueExercises = 0;
  let completedWeeks = 0;

  weeklyData.forEach((exercises, week) => {
    if (week !== currentWeekKey) {
      // Solo contar semanas completadas (no la semana actual)
      totalUniqueExercises += exercises.size;
      completedWeeks++;
    }
  });

  // Si no hay semanas completadas, usar todas las semanas
  if (completedWeeks === 0) {
    totalUniqueExercises = Array.from(weeklyData.values()).reduce((sum, exercises) => sum + exercises.size, 0);
    completedWeeks = weeklyData.size;
  }

  const exercisesPerWeek = totalUniqueExercises > 0 && completedWeeks > 0
    ? totalUniqueExercises / completedWeeks
    : 0;

  return exercisesPerWeek;
};

/**
 * Calcula la consistencia de entrenamiento (mejorado)
 * MEJORADO: Lógica más robusta y valores más realistas
 * CORREGIDO: Ahora usa la nueva lógica de frecuencia por semanas
 * MEJORADO: Considera solo semanas completadas para un cálculo más preciso
 */
export const calculateTrainingConsistency = (records: WorkoutRecord[], days = 30): number => {
  if (records.length === 0) return 0;

  // ✅ OPTIMIZACIÓN: Usar función centralizada de ordenamiento
  const sortedRecords = sortRecordsByDateAscending(records);

  // Si tenemos menos registros que días, usar todos los registros
  const recordsToAnalyze = sortedRecords.slice(-Math.min(days, sortedRecords.length));

  if (recordsToAnalyze.length === 0) return 0;

  // Calcular frecuencia usando la nueva lógica por semanas (solo semanas completadas)
  const actualFrequency = calculateTrainingFrequency(records, days);
  const expectedFrequency = 5; // Para alguien que entrena 5 días/semana

  // Consistencia basada en qué tan cerca estás de tu frecuencia objetivo
  const frequencyConsistency = Math.min(100, (actualFrequency / expectedFrequency) * 100);

  // Penalizar por gaps largos (pero menos agresivamente) - solo en semanas completadas
  const gaps = calculateTrainingGaps(recordsToAnalyze);
  const gapPenalty = Math.min(10, gaps * 1); // Máximo 10% de penalización

  // Bonus por regularidad (si entrenas consistentemente)
  const regularityBonus = actualFrequency >= 4.5 ? 5 : 0;

  const result = Math.max(0, Math.min(100, frequencyConsistency - gapPenalty + regularityBonus));

  return result;
};

/**
 * Calcula los gaps de entrenamiento
 */
const calculateTrainingGaps = (records: WorkoutRecord[]): number => {
  if (records.length < 2) return 0;

  // ✅ OPTIMIZACIÓN: Usar función centralizada de ordenamiento
  const sortedRecords = sortRecordsByDateAscending(records);

  let totalGaps = 0;
  let gapCount = 0;

  for (let i = 1; i < sortedRecords.length; i++) {
    const daysDiff = (new Date(sortedRecords[i].date).getTime() - new Date(sortedRecords[i - 1].date).getTime()) / (1000 * 60 * 60 * 24);

    if (daysDiff > 3) { // Gap de más de 3 días
      totalGaps += daysDiff;
      gapCount++;
    }
  }

  return gapCount > 0 ? totalGaps / gapCount : 0;
};

/**
 * Calcula la progresión de intensidad
 */
export const calculateIntensityProgression = (records: WorkoutRecord[], days = 30): number => {
  if (records.length < 2) return 0;

  // ✅ OPTIMIZACIÓN: Usar función centralizada de ordenamiento
  const sortedRecords = sortRecordsByDateAscending(records);

  // Si tenemos menos registros que días, usar todos los registros
  const recordsToAnalyze = sortedRecords.slice(-Math.min(days, sortedRecords.length));

  if (recordsToAnalyze.length === 0) return 0;

  // Usar función utilitaria para separar semanas completadas
  const { completedRecords } = separateCompletedWeeksFromCurrent(recordsToAnalyze);

  // Si no hay registros de semanas completadas, usar todos los registros
  const recordsToCompare = completedRecords.length > 0 ? completedRecords : recordsToAnalyze;

  // Dividir en períodos reciente y anterior
  const midPoint = Math.floor(recordsToCompare.length / 2);
  const recentRecords = recordsToCompare.slice(midPoint);
  const olderRecords = recordsToCompare.slice(0, midPoint);

  if (recentRecords.length === 0 || olderRecords.length === 0) return 0;

  const recentAvgIntensity = recentRecords.reduce((sum, r) => sum + (r.weight / r.reps), 0) / recentRecords.length;
  const olderAvgIntensity = olderRecords.reduce((sum, r) => sum + (r.weight / r.reps), 0) / olderRecords.length;

  return recentAvgIntensity - olderAvgIntensity;
};

/**
 * Función utilitaria para separar registros de semanas completadas vs semana actual
 * MEJORADO: Reutilizable para todas las métricas que necesiten esta lógica
 */
export const separateCompletedWeeksFromCurrent = (records: WorkoutRecord[]): {
  completedRecords: WorkoutRecord[];
  currentWeekRecords: WorkoutRecord[];
  currentWeekKey: string;
} => {
  // Identificar la semana actual
  const today = new Date();
  const currentMonday = new Date(today);
  currentMonday.setDate(today.getDate() - today.getDay() + 1);
  const currentWeekKey = currentMonday.toISOString().split('T')[0];

  // Separar registros de semanas completadas vs semana actual
  const completedRecords: WorkoutRecord[] = [];
  const currentWeekRecords: WorkoutRecord[] = [];

  records.forEach(record => {
    const date = new Date(record.date);
    const monday = new Date(date);
    monday.setDate(date.getDate() - date.getDay() + 1);
    const weekKey = monday.toISOString().split('T')[0];

    if (weekKey === currentWeekKey) {
      currentWeekRecords.push(record);
    } else {
      completedRecords.push(record);
    }
  });

  return {
    completedRecords,
    currentWeekRecords,
    currentWeekKey,
  };
};
