import type { WorkoutRecord } from '@/interfaces';
import { calculateOptimal1RM } from './calculate-1rm.utils';
import { clamp, roundToDecimals } from './math-utils';

/**
 * Obtiene el peso máximo de los registros
 * Patrón usado +10 veces: Math.max(...records.map(r => r.weight))
 */
export const getMaxWeight = (records: WorkoutRecord[]): number => {
  if (records.length === 0) return 0;
  return Math.max(...records.map(r => r.weight));
};

/**
 * Obtiene el peso mínimo de los registros
 * Patrón usado +5 veces: Math.min(...records.map(r => r.weight))
 */
export const getMinWeight = (records: WorkoutRecord[]): number => {
  if (records.length === 0) return 0;
  return Math.min(...records.map(r => r.weight));
};

/**
 * Obtiene el 1RM máximo estimado de los registros
 * Patrón usado +5 veces: Math.max(...records.map(r => r.weight * (1 + Math.min(r.reps, 20) / 30)))
 */
export const getMaxEstimated1RM = (records: WorkoutRecord[]): number => {
  if (records.length === 0) return 0;
  return Math.max(...records.map(r => r.weight * (1 + Math.min(r.reps, 20) / 30)));
};

/**
 * Obtiene la fecha más reciente de los registros
 * Patrón usado +5 veces: new Date(Math.max(...records.map(r => new Date(r.date).getTime())))
 */
export const getLatestDate = (records: WorkoutRecord[]): Date => {
  if (records.length === 0) return new Date();
  return new Date(Math.max(...records.map(r => new Date(r.date).getTime())));
};

/**
 * Obtiene registros de los últimos N días
 * Patrón usado +3 veces: records.filter(r => differenceInDays(now, r.date) <= days)
 */
export const getRecordsFromLastDays = (records: WorkoutRecord[], days: number): WorkoutRecord[] => {
  const now = new Date();
  return records.filter(r => {
    const daysDiff = (now.getTime() - new Date(r.date).getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff <= days;
  });
};

/**
 * Valida y corrige tendencia de fuerza
 * Patrón usado +6 veces: Math.max(-max, Math.min(max, value))
 */
export const validateStrengthTrend = (trend: number, maxTrend: number = 2): number => {
  return clamp(trend, -maxTrend, maxTrend);
};

/**
 * Valida y corrige crecimiento mensual
 * Patrón usado +4 veces: Math.max(-5, Math.min(10, growth))
 */
export const validateMonthlyGrowth = (growth: number, min: number = -5, max: number = 10): number => {
  return clamp(growth, min, max);
};

/**
 * Valida y corrige tiempo hasta próximo PR
 * Patrón usado +3 veces: Math.max(1, Math.min(52, weeks))
 */
export const validateTimeToNextPR = (weeks: number, min: number = 1, max: number = 52): number => {
  return clamp(weeks, min, max);
};

/**
 * Valida y corrige nivel de confianza
 * Patrón usado +4 veces: Math.max(0.3, Math.min(0.9, confidence))
 */
export const validateConfidence = (confidence: number, min: number = 0.3, max: number = 0.9): number => {
  return clamp(confidence, min, max);
};

/**
 * Valida y corrige mejora
 * Patrón usado +4 veces: Math.max(-80, Math.min(300, improvement))
 */
export const validateImprovement = (improvement: number, min: number = -80, max: number = 300): number => {
  return clamp(improvement, min, max);
};

/**
 * Obtiene el peso actual (promedio de últimos N días)
 * Patrón usado +3 veces: Math.max(...recentRecords.map(r => r.weight))
 */
export const getCurrentWeight = (records: WorkoutRecord[], days: number = 30): number => {
  const recentRecords = getRecordsFromLastDays(records, days);
  if (recentRecords.length === 0) return 0;
  return getMaxWeight(recentRecords);
};

/**
 * Obtiene el 1RM base (promedio de primeros registros)
 * Patrón usado +2 veces: Math.max(...records.map(r => calculateOptimal1RM(r.weight, r.reps)))
 */
export const getBaseline1RM = (records: WorkoutRecord[]): number => {
  if (records.length === 0) return 0;
  return Math.max(...records.map(r => calculateOptimal1RM(r.weight, r.reps)));
};

/**
 * Calcula la mejora porcentual
 * Patrón usado +2 veces: ((current - baseline) / baseline) * 100
 */
export const calculateImprovement = (current: number, baseline: number): number => {
  if (baseline === 0) return 0;
  return roundToDecimals(((current - baseline) / baseline) * 100);
}; 