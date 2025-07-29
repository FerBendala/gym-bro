import { useAdvancedAnalysis } from '@/hooks/use-advanced-analysis';
import type { WorkoutRecord } from '@/interfaces';
import { calculateNormalizedVolumeTrend, formatNumberToString } from '@/utils';
import { getConfidenceExplanation } from '@/utils/functions/confidence-utils';
import { roundToDecimals } from '@/utils/functions/math-utils';
import {
  getMaxWeight,
  getRecordsFromLastDays,
  validateMonthlyGrowth,
  validateStrengthTrend,
  validateTimeToNextPR as validateTimeToNextPRUtil
} from '@/utils/functions/workout-utils';
import { useMemo } from 'react';
import { usePredictionMetrics } from './use-prediction-metrics';

const validateNextWeekWeight = (records: WorkoutRecord[], rawPrediction: number): number => {
  const recentRecords = getRecordsFromLastDays(records, 30);
  if (recentRecords.length === 0) return 0;

  const maxRecentWeight = getMaxWeight(recentRecords);

  // Usar el peso máximo como base
  const minReasonable = maxRecentWeight * 0.95; // Mínimo 95% del peso máximo
  const maxReasonable = maxRecentWeight + 2.5; // Máximo +2.5kg mejora semanal

  let result: number;

  if (rawPrediction < minReasonable) {
    result = roundToDecimals(maxRecentWeight * 1.01); // 1% mejora conservadora del peso máximo
  } else if (rawPrediction > maxReasonable) {
    result = roundToDecimals(maxReasonable);
  } else {
    result = roundToDecimals(rawPrediction);
  }

  return result;
};

const validatePRWeight = (records: WorkoutRecord[], rawPrediction: number, nextWeekWeight?: number): number => {
  const recentRecords = getRecordsFromLastDays(records, 30);
  if (recentRecords.length === 0) return 0;

  const recentMaxWeight = getMaxWeight(recentRecords);

  if (recentMaxWeight > 0) {
    // PR futuro debe ser progresivo (6 semanas = +5-15kg adicionales)
    const baseNextWeek = nextWeekWeight || (recentMaxWeight * 1.01);
    const minReasonablePR = Math.max(
      baseNextWeek + 2.5, // Al menos 2.5kg más que próxima semana
      recentMaxWeight * 1.05  // O mínimo 5% mejora total
    );
    const maxReasonablePR = recentMaxWeight * 1.20; // Máximo 20% mejora

    if (rawPrediction < minReasonablePR) {
      return roundToDecimals(minReasonablePR);
    } else if (rawPrediction > maxReasonablePR) {
      return roundToDecimals(maxReasonablePR);
    }
  }

  return roundToDecimals(rawPrediction);
};

const validateTimeToNextPRAdvanced = (rawTime: number, nextWeekWeight?: number, prWeight?: number, strengthTrend?: number): number => {
  // Si tenemos datos para calcular tiempo realista desde próxima semana
  if (nextWeekWeight && prWeight && strengthTrend && strengthTrend > 0) {
    const weightDifference = prWeight - nextWeekWeight; // Desde próxima semana, no desde hoy
    const weeksNeeded = Math.max(1, Math.ceil(weightDifference / strengthTrend));

    // ✅ Cálculo realista implementado

    return Math.max(1, Math.min(52, weeksNeeded));
  }

  // Fallback al valor original validado
  return validateTimeToNextPRUtil(rawTime || 8); // Usar la utilidad centralizada
};

const calculateValidatedCurrentWeight = (records: WorkoutRecord[]): number => {
  const recentRecords = getRecordsFromLastDays(records, 30);
  if (recentRecords.length === 0) return 0;

  const currentWeight = getMaxWeight(recentRecords);
  return roundToDecimals(currentWeight); // Redondear a 2 decimales
};

export const usePredictionsData = (records: WorkoutRecord[]) => {
  // ✅ USAR HOOK CENTRALIZADO: Evita duplicación de análisis
  const analysis = useAdvancedAnalysis(records);

  // 🎯 MÉTRICAS CENTRALIZADAS COMPLETAS - Una sola fuente de verdad
  const centralizedMetrics = useMemo(() => {
    const currentWeight = calculateValidatedCurrentWeight(records);
    const nextWeekWeight = validateNextWeekWeight(records, analysis.progressPrediction.nextWeekWeight);
    const prWeight = validatePRWeight(records, analysis.progressPrediction.predictedPR.weight, nextWeekWeight);
    // ✅ ELIMINADAS REDUNDANCIAS: Usar funciones de workout-utils.ts
    const strengthTrend = validateStrengthTrend(analysis.progressPrediction.strengthTrend);
    const monthlyGrowth = validateMonthlyGrowth(analysis.progressPrediction.monthlyGrowthRate);
    const timeToNextPR = validateTimeToNextPRAdvanced(
      analysis.progressPrediction.timeToNextPR,
      nextWeekWeight,
      prWeight,
      strengthTrend
    );

    const normalizedVolumeTrend = calculateNormalizedVolumeTrend(records);

    return {
      // Métricas validadas centralizadas
      currentWeight,
      nextWeekWeight,
      prWeight,
      strengthTrend,
      monthlyGrowth,
      timeToNextPR,
      improvement: prWeight - currentWeight,
      improvementPercentage: formatNumberToString(((prWeight / currentWeight - 1) * 100), 1),
      nextWeekIncrease: nextWeekWeight - currentWeight,
      prIncrease: prWeight - nextWeekWeight,

      // 🎯 CORRECCIÓN CRÍTICA: Usar tendencia normalizada, no la original
      volumeTrend: normalizedVolumeTrend, // ✅ Tendencia corregida por día de la semana
      plateauRisk: analysis.progressPrediction.plateauRisk,
      confidenceLevel: analysis.progressPrediction.confidenceLevel,
      prConfidence: analysis.progressPrediction.predictedPR.confidence,
      trendAnalysis: analysis.progressPrediction.trendAnalysis,
      recommendations: analysis.progressPrediction.recommendations,

      // Valores raw para tooltips y comparaciones
      rawNextWeek: analysis.progressPrediction.nextWeekWeight,
      rawPR: analysis.progressPrediction.predictedPR.weight,
      rawStrengthTrend: analysis.progressPrediction.strengthTrend,
      rawMonthlyGrowth: analysis.progressPrediction.monthlyGrowthRate
    };
  }, [records, analysis]);

  // Usar el hook mejorado para calcular métricas de forma optimizada
  const predictionMetrics = usePredictionMetrics(
    records,
    analysis.progressPrediction.predictedPR.weight
  );

  // ✅ USAR UTILIDAD CENTRALIZADA: Función para obtener explicación de nivel de confianza
  const confidenceInfo = getConfidenceExplanation(centralizedMetrics.confidenceLevel);

  return {
    analysis,
    centralizedMetrics,
    predictionMetrics,
    confidenceInfo
  };
}; 