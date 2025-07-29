import type { WorkoutRecord } from '@/interfaces';
import { calculateOptimal1RM } from './calculate-1rm.utils';
import { clamp, roundToDecimals } from './math-utils';

/**
 * Obtiene el peso máximo de un conjunto de registros
 * Patrón usado +10 veces: Math.max(...records.map(r => r.weight))
 */
export const getMaxWeight = (records: WorkoutRecord[]): number => {
  if (records.length === 0) return 0;
  return Math.max(...records.map(r => r.weight));
};

/**
 * Obtiene el peso máximo estimado de 1RM de un conjunto de registros
 * Patrón usado +5 veces: Math.max(...records.map(r => r.weight * (1 + Math.min(r.reps, 20) / 30)))
 */
export const getMaxEstimated1RM = (records: WorkoutRecord[]): number => {
  if (records.length === 0) return 0;
  return Math.max(...records.map(r => r.weight * (1 + Math.min(r.reps, 20) / 30)));
};

/**
 * Obtiene la fecha más reciente de un conjunto de registros
 * Patrón usado +5 veces: new Date(Math.max(...records.map(r => new Date(r.date).getTime())))
 */
export const getLatestDate = (records: WorkoutRecord[]): Date => {
  if (records.length === 0) return new Date();
  return new Date(Math.max(...records.map(r => new Date(r.date).getTime())));
};

/**
 * Obtiene registros de los últimos N días
 * Patrón usado +8 veces: records.filter(r => new Date(r.date) >= cutoffDate)
 */
export const getRecordsFromLastDays = (records: WorkoutRecord[], days: number): WorkoutRecord[] => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  return records.filter(r => new Date(r.date) >= cutoffDate);
};

/**
 * Valida si una tendencia está dentro de un rango aceptable
 * Patrón usado +6 veces: Math.max(-max, Math.min(max, value))
 */
export const validateStrengthTrend = (trend: number, maxTrend: number = 2): number => {
  return clamp(trend, -maxTrend, maxTrend);
};

/**
 * Valida si un crecimiento mensual está dentro de un rango aceptable
 * Patrón usado +4 veces: Math.max(-5, Math.min(10, growth))
 */
export const validateMonthlyGrowth = (growth: number, min: number = -5, max: number = 10): number => {
  return clamp(growth, min, max);
};

/**
 * Valida el tiempo estimado para el próximo PR
 * Patrón usado +3 veces: Math.max(1, Math.min(52, weeks))
 */
export const validateTimeToNextPR = (weeks: number, min: number = 1, max: number = 52): number => {
  return clamp(weeks, min, max);
};

/**
 * Valida el nivel de confianza
 * Patrón usado +4 veces: Math.max(0.3, Math.min(0.9, confidence))
 */
export const validateConfidence = (confidence: number, min: number = 0.3, max: number = 0.9): number => {
  return clamp(confidence, min, max);
};

/**
 * Valida el porcentaje de mejora
 * Patrón usado +4 veces: Math.max(-80, Math.min(300, improvement))
 */
export const validateImprovement = (improvement: number, min: number = -80, max: number = 300): number => {
  return clamp(improvement, min, max);
};

/**
 * Obtiene el peso actual (máximo reciente)
 * Patrón usado +3 veces: Math.max(...recentRecords.map(r => r.weight))
 */
export const getCurrentWeight = (records: WorkoutRecord[], days: number = 30): number => {
  const recentRecords = getRecordsFromLastDays(records, days);
  return getMaxWeight(recentRecords);
};

/**
 * Calcula el 1RM base para predicciones
 * Patrón usado +2 veces: Math.max(...records.map(r => calculateOptimal1RM(r.weight, r.reps)))
 */
export const getBaseline1RM = (records: WorkoutRecord[]): number => {
  if (records.length === 0) return 0;
  return Math.max(...records.map(r => calculateOptimal1RM(r.weight, r.reps)));
};

/**
 * Calcula la mejora porcentual entre dos valores
 * Patrón usado +3 veces: ((current - baseline) / baseline) * 100
 */
export const calculateImprovement = (current: number, baseline: number): number => {
  if (baseline === 0) return 0;
  return roundToDecimals(((current - baseline) / baseline) * 100);
}; 