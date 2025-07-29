import { differenceInDays } from 'date-fns';

import { calculateOptimal1RM } from './calculate-1rm.utils';
import { clamp, roundToDecimals } from './math-utils';

import type { WorkoutRecord } from '@/interfaces';

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
 * Patrón usado +8 veces: new Date(Math.max(...records.map(r => new Date(r.date).getTime())))
 */
export const getLatestDate = (records: WorkoutRecord[]): Date => {
  if (records.length === 0) return new Date();
  return new Date(Math.max(...records.map(r => new Date(r.date).getTime())));
};

/**
 * Obtiene registros de los últimos N días
 * Patrón usado +6 veces: records.filter(r => differenceInDays(now, new Date(r.date)) <= days)
 */
export const getRecordsFromLastDays = (records: WorkoutRecord[], days: number): WorkoutRecord[] => {
  const now = new Date();
  return records.filter(r => {
    const daysDiff = differenceInDays(now, new Date(r.date));
    return daysDiff >= 0 && daysDiff <= days;
  });
};

/**
 * Filtra registros por rango de días
 * Patrón usado +4 veces: records.filter(r => daysDiff >= minDays && daysDiff <= maxDays)
 */
export const getRecordsByDayRange = (records: WorkoutRecord[], minDays: number, maxDays: number): WorkoutRecord[] => {
  const now = new Date();
  return records.filter(r => {
    const daysDiff = differenceInDays(now, new Date(r.date));
    return daysDiff >= minDays && daysDiff <= maxDays;
  });
};

/**
 * Ordena registros por fecha (más reciente primero)
 * Patrón usado +8 veces: records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
 */
export const sortRecordsByDate = (records: WorkoutRecord[], ascending = false): WorkoutRecord[] => {
  return [...records].sort((a, b) => {
    const timeA = new Date(a.date).getTime();
    const timeB = new Date(b.date).getTime();
    return ascending ? timeA - timeB : timeB - timeA;
  });
};

/**
 * Ordena registros por fecha (más antiguo primero)
 * Patrón usado +6 veces: records.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
 */
export const sortRecordsByDateAscending = (records: WorkoutRecord[]): WorkoutRecord[] => {
  return sortRecordsByDate(records, true);
};

/**
 * Valida y corrige tendencia de fuerza
 * Patrón usado +4 veces: Math.max(-max, Math.min(max, value))
 */
export const validateStrengthTrend = (trend: number, maxTrend = 2): number => {
  return clamp(trend, -maxTrend, maxTrend);
};

/**
 * Valida y corrige crecimiento mensual
 * Patrón usado +4 veces: Math.max(-5, Math.min(10, growth))
 */
export const validateMonthlyGrowth = (growth: number, min = -5, max = 10): number => {
  return clamp(growth, min, max);
};

/**
 * Valida y corrige tiempo hasta próximo PR
 * Patrón usado +3 veces: Math.max(1, Math.min(52, weeks))
 */
export const validateTimeToNextPR = (weeks: number, min = 1, max = 52): number => {
  return clamp(weeks, min, max);
};

/**
 * Valida y corrige nivel de confianza
 * Patrón usado +4 veces: Math.max(0.3, Math.min(0.9, confidence))
 */
export const validateConfidence = (confidence: number, min = 0.3, max = 0.9): number => {
  return clamp(confidence, min, max);
};

/**
 * Valida y corrige mejora
 * Patrón usado +4 veces: Math.max(-80, Math.min(300, improvement))
 */
export const validateImprovement = (improvement: number, min = -80, max = 300): number => {
  return clamp(improvement, min, max);
};

/**
 * Obtiene el peso actual (promedio de últimos N días)
 * Patrón usado +3 veces: Math.max(...recentRecords.map(r => r.weight))
 */
export const getCurrentWeight = (records: WorkoutRecord[], days = 30): number => {
  const recentRecords = getRecordsFromLastDays(records, days);
  if (recentRecords.length === 0) return 0;
  return Math.max(...recentRecords.map(r => r.weight));
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
 * Calcula mejora porcentual
 * Patrón usado +3 veces: ((current - baseline) / baseline) * 100
 */
export const calculateImprovement = (current: number, baseline: number): number => {
  if (baseline === 0) return 0;
  return roundToDecimals(((current - baseline) / baseline) * 100);
};
