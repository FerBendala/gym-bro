import type { WorkoutRecord } from '@/interfaces';
import { useMemo } from 'react';
import {
  calculatePredictionMetrics,
  type PredictionMetrics
} from '../../../utils/functions/advanced-analysis';
import { normalizeByWeekday } from '../../../utils/functions/category-analysis';

/**
 * Valida un registro de entrenamiento para predicciones
 */
const isValidRecord = (record: WorkoutRecord): boolean => {
  return record.weight > 0 &&
    record.reps > 0 &&
    record.sets > 0 &&
    record.weight <= 1000 && // Peso máximo realista
    record.reps <= 50 && // Repeticiones máximas realistas
    record.sets <= 20 && // Series máximas realistas
    record.date && !isNaN(new Date(record.date).getTime()); // Fecha válida
};

/**
 * Interfaz extendida para métricas con información de calidad y normalización por día de la semana
 */
export interface EnhancedPredictionMetrics extends PredictionMetrics {
  dataQuality: {
    totalRecords: number;
    validRecords: number;
    validationRate: number; // 0-100
    hasRecentData: boolean;
    dataSpan: number; // días entre primer y último registro
    qualityScore: number; // 0-100
  };
  // Nuevas métricas normalizadas por día de la semana
  weekdayNormalization: {
    currentWeekdayFactor: number;
    isPartialWeek: boolean;
    normalizedVolumeTrend: number;
  };
}

/**
 * Hook para calcular métricas de predicciones de forma optimizada con validación
 * Filtra registros inválidos y proporciona información sobre calidad de datos
 * 
 * @param records - Array de registros de entrenamiento
 * @param predictedPRWeight - Peso del PR predicho
 * @returns Métricas calculadas, formateadas y con información de calidad
 */
export const usePredictionMetrics = (
  records: WorkoutRecord[],
  predictedPRWeight: number
): EnhancedPredictionMetrics => {
  return useMemo(() => {
    // Validar y filtrar registros
    const validRecords = records.filter(isValidRecord);
    const now = new Date();

    // Calcular métricas de calidad de datos
    const totalRecords = records.length;
    const validRecordsCount = validRecords.length;
    const validationRate = totalRecords > 0 ? (validRecordsCount / totalRecords) * 100 : 0;

    // Verificar si hay datos recientes (últimos 30 días)
    const recentRecords = validRecords.filter(r => {
      const recordDate = new Date(r.date);
      const daysDiff = (now.getTime() - recordDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff <= 30;
    });
    const hasRecentData = recentRecords.length > 0;

    // Calcular span temporal de datos
    let dataSpan = 0;
    if (validRecords.length > 1) {
      const sortedRecords = [...validRecords].sort((a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      const firstDate = new Date(sortedRecords[0].date);
      const lastDate = new Date(sortedRecords[sortedRecords.length - 1].date);
      dataSpan = Math.floor((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));
    }

    // Calcular score de calidad general
    let qualityScore = 0;
    qualityScore += validationRate * 0.3; // 30% por tasa de validación
    qualityScore += hasRecentData ? 25 : 0; // 25% por datos recientes
    qualityScore += Math.min(25, (validRecordsCount / 10) * 25); // 25% por cantidad de datos
    qualityScore += Math.min(20, (dataSpan / 90) * 20); // 20% por span temporal

    // Calcular métricas base usando registros validados
    const baseMetrics = calculatePredictionMetrics(validRecords, predictedPRWeight);

    // **NUEVA FUNCIONALIDAD**: Calcular normalización por día de la semana
    const currentDate = new Date();
    const { weekdayFactor } = normalizeByWeekday(100, 100, currentDate); // Usar valores dummy para obtener el factor

    // Determinar si estamos en una semana parcial (factor < 1.0)
    const isPartialWeek = weekdayFactor < 1.0;

    // Por ahora, usar un valor por defecto para normalizedVolumeTrend
    // TODO: Integrar con las métricas de tendencia completas cuando estén disponibles
    const normalizedVolumeTrend = 0;

    return {
      ...baseMetrics,
      dataQuality: {
        totalRecords,
        validRecords: validRecordsCount,
        validationRate: Math.round(validationRate),
        hasRecentData,
        dataSpan,
        qualityScore: Math.round(Math.min(100, qualityScore))
      },
      weekdayNormalization: {
        currentWeekdayFactor: weekdayFactor,
        isPartialWeek,
        normalizedVolumeTrend: Math.round(normalizedVolumeTrend)
      }
    };
  }, [records, predictedPRWeight]);
}; 