import type { WorkoutRecord } from '@/interfaces';
import { calculateOptimal1RM } from './calculate-1rm-optimal.utils';
import { getLastCompleteWeekRecords } from './week-records.utils';

/**
 * Calcula el 1RM promedio de la última semana completa
 * Usa la misma lógica temporal que las predicciones
 */
const calculateBaseline1RM = (records: WorkoutRecord[]): number => {
  const lastWeekRecords = getLastCompleteWeekRecords(records);

  if (lastWeekRecords.length === 0) {
    // Fallback: últimos 5 entrenamientos si no hay semana completa
    const recentRecords = records.slice(-5);
    if (recentRecords.length === 0) return 0;

    const recent1RMs = recentRecords.map(r => calculateOptimal1RM(r.weight, r.reps));
    return recent1RMs.reduce((sum, rm) => sum + rm, 0) / recent1RMs.length;
  }

  const lastWeek1RMs = lastWeekRecords.map(r => calculateOptimal1RM(r.weight, r.reps));
  return lastWeek1RMs.reduce((sum, rm) => sum + rm, 0) / lastWeek1RMs.length;
};

/**
 * Calcula la mejora esperada del PR vs baseline
 */
const calculatePRImprovement = (records: WorkoutRecord[], predictedPRWeight: number): number => {
  const baseline1RM = calculateBaseline1RM(records);
  return Math.max(0, predictedPRWeight - baseline1RM);
};

/**
 * Interfaz para métricas calculadas del frontend
 */
export interface PredictionMetrics {
  baseline1RM: number;
  improvement: number;
  formattedBaseline: string;
  formattedImprovement: string;
}

/**
 * Calcula todas las métricas necesarias para el frontend de predicciones
 * Optimizada para usarse con useMemo
 */
export const calculatePredictionMetrics = (
  records: WorkoutRecord[],
  predictedPRWeight: number
): PredictionMetrics => {
  const baseline1RM = calculateBaseline1RM(records);
  const improvement = calculatePRImprovement(records, predictedPRWeight);

  return {
    baseline1RM,
    improvement,
    formattedBaseline: baseline1RM > 0 ? baseline1RM.toFixed(1) : '0.0',
    formattedImprovement: improvement > 0 ? `+${improvement.toFixed(1)}kg` : 'Sin mejora'
  };
}; 