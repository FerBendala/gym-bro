import type { WorkoutRecord } from '@/interfaces';
import { calculateAdvancedAnalysis, calculateNormalizedVolumeTrend, formatNumberToString } from '@/utils';
import { useMemo } from 'react';
import { usePredictionMetrics } from './use-prediction-metrics';

// Obtener registros recientes con fallback inteligente
const getRecentRecords = (records: WorkoutRecord[], days: number = 30) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  const recentRecords = records.filter(r => new Date(r.date) >= cutoffDate);

  if (recentRecords.length === 0) {
    const sortedRecords = [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return sortedRecords.slice(0, 5);
  }

  return recentRecords;
};

const validateNextWeekWeight = (records: WorkoutRecord[], rawPrediction: number): number => {
  const recentRecords = getRecentRecords(records);
  if (recentRecords.length === 0) return 0;

  const maxRecentWeight = Math.max(...recentRecords.map(r => r.weight));

  // CORRECCIÓN CRÍTICA: usar el peso máximo como base, NO el promedio
  // La próxima semana debe estar cerca del peso máximo actual
  const minReasonable = maxRecentWeight * 0.95; // Mínimo 95% del peso máximo
  const maxReasonable = maxRecentWeight + 2.5; // Máximo +2.5kg mejora semanal

  let result: number;

  if (rawPrediction < minReasonable) {
    result = Math.round(maxRecentWeight * 1.01 * 100) / 100; // 1% mejora conservadora del peso máximo
  } else if (rawPrediction > maxReasonable) {
    result = Math.round(maxReasonable * 100) / 100;
  } else {
    result = Math.round(rawPrediction * 100) / 100;
  }

  return result;
};

const validatePRWeight = (records: WorkoutRecord[], rawPrediction: number, nextWeekWeight?: number): number => {
  const recentRecords = getRecentRecords(records);
  if (recentRecords.length === 0) return 0;

  const recentMaxWeight = Math.max(...recentRecords.map(r => r.weight));

  if (recentMaxWeight > 0) {
    // CORRECCIÓN: PR futuro debe ser progresivo (6 semanas = +5-15kg adicionales)
    const baseNextWeek = nextWeekWeight || (recentMaxWeight * 1.01);
    const minReasonablePR = Math.max(
      baseNextWeek + 2.5, // Al menos 2.5kg más que próxima semana
      recentMaxWeight * 1.05  // O mínimo 5% mejora total
    );
    const maxReasonablePR = recentMaxWeight * 1.20; // Máximo 20% mejora

    if (rawPrediction < minReasonablePR) {
      return Math.round(minReasonablePR * 100) / 100;
    } else if (rawPrediction > maxReasonablePR) {
      return Math.round(maxReasonablePR * 100) / 100;
    }
  }

  return Math.round(rawPrediction * 100) / 100;
};

const validateStrengthTrend = (rawTrend: number): number => {
  const validTrend = Math.max(-2, Math.min(2, rawTrend)); // Limitar a ±2kg/sem
  return Math.round(validTrend * 100) / 100; // Redondear a 2 decimales
};

const validateMonthlyGrowth = (rawGrowth: number): number => {
  const validGrowth = Math.max(-5, Math.min(10, rawGrowth)); // Rango realista: -5kg a +10kg/mes
  return Math.round(validGrowth * 100) / 100; // Redondear a 2 decimales
};

const validateTimeToNextPR = (rawTime: number, nextWeekWeight?: number, prWeight?: number, strengthTrend?: number): number => {
  // Si tenemos datos para calcular tiempo realista desde próxima semana
  if (nextWeekWeight && prWeight && strengthTrend && strengthTrend > 0) {
    const weightDifference = prWeight - nextWeekWeight; // Desde próxima semana, no desde hoy
    const weeksNeeded = Math.max(1, Math.ceil(weightDifference / strengthTrend));

    // ✅ Cálculo realista implementado

    return Math.max(1, Math.min(52, weeksNeeded));
  }

  // Fallback al valor original validado
  return Math.max(1, Math.min(52, rawTime || 8)); // Entre 1 y 52 semanas
};

const calculateValidatedCurrentWeight = (records: WorkoutRecord[]): number => {
  const recentRecords = getRecentRecords(records);
  if (recentRecords.length === 0) return 0;

  const currentWeight = Math.max(...recentRecords.map(r => r.weight));
  return Math.round(currentWeight * 100) / 100; // Redondear a 2 decimales
};

export const usePredictionsData = (records: WorkoutRecord[]) => {
  const analysis = useMemo(() => calculateAdvancedAnalysis(records), [records]);

  // 🎯 MÉTRICAS CENTRALIZADAS COMPLETAS - Una sola fuente de verdad
  const centralizedMetrics = useMemo(() => {
    const currentWeight = calculateValidatedCurrentWeight(records);
    const nextWeekWeight = validateNextWeekWeight(records, analysis.progressPrediction.nextWeekWeight);
    const prWeight = validatePRWeight(records, analysis.progressPrediction.predictedPR.weight, nextWeekWeight);
    const strengthTrend = validateStrengthTrend(analysis.progressPrediction.strengthTrend);
    const monthlyGrowth = validateMonthlyGrowth(analysis.progressPrediction.monthlyGrowthRate);
    const timeToNextPR = validateTimeToNextPR(
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

  // Función para obtener explicación de nivel de confianza
  const getConfidenceExplanation = (confidence: number): {
    level: string;
    description: string;
    color: string;
    factors: string[];
  } => {
    if (confidence >= 80) {
      return {
        level: 'Muy Alta',
        description: 'Predicción muy confiable basada en datos consistentes y patrones claros',
        color: 'text-green-400',
        factors: [
          'Datos abundantes y consistentes',
          'Progresión clara y estable',
          'Entrenamientos regulares recientes'
        ]
      };
    } else if (confidence >= 60) {
      return {
        level: 'Alta',
        description: 'Predicción confiable con datos suficientes para análisis preciso',
        color: 'text-blue-400',
        factors: [
          'Suficientes datos históricos',
          'Patrones de progreso identificables',
          'Regularidad en entrenamientos'
        ]
      };
    } else if (confidence >= 40) {
      return {
        level: 'Moderada',
        description: 'Predicción con incertidumbre moderada, usar como orientación general',
        color: 'text-yellow-400',
        factors: [
          'Datos limitados o irregulares',
          'Progresión variable o inconsistente',
          'Períodos largos sin entrenar'
        ]
      };
    } else if (confidence >= 20) {
      return {
        level: 'Baja',
        description: 'Predicción incierta, requiere más datos para mayor precisión',
        color: 'text-orange-400',
        factors: [
          'Pocos datos históricos',
          'Gran variabilidad en rendimiento',
          'Entrenamientos muy esporádicos'
        ]
      };
    } else {
      return {
        level: 'Muy Baja',
        description: 'Predicción no confiable, se necesitan más entrenamientos consistentes',
        color: 'text-red-400',
        factors: [
          'Datos insuficientes o de mala calidad',
          'Sin patrones identificables',
          'Falta de consistencia temporal'
        ]
      };
    }
  };

  const confidenceInfo = getConfidenceExplanation(centralizedMetrics.confidenceLevel);

  return {
    analysis,
    centralizedMetrics,
    predictionMetrics,
    confidenceInfo
  };
}; 