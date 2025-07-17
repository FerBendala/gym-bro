import { useMemo } from 'react';
import type { WorkoutRecord } from '../../../interfaces';
import {
  calculatePredictionMetrics,
  type PredictionMetrics
} from '../../../utils/functions/advanced-analysis';

/**
 * Hook para calcular métricas de predicciones de forma optimizada
 * Utiliza memoización para evitar recálculos innecesarios
 * 
 * @param records - Array de registros de entrenamiento
 * @param predictedPRWeight - Peso del PR predicho
 * @returns Métricas calculadas y formateadas
 */
export const usePredictionMetrics = (
  records: WorkoutRecord[],
  predictedPRWeight: number
): PredictionMetrics => {
  return useMemo(() => {
    return calculatePredictionMetrics(records, predictedPRWeight);
  }, [records, predictedPRWeight]);
}; 