import type { WorkoutRecord } from '@/interfaces';
import { startOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import { clamp, roundToDecimals } from './math-utils';
import { calculateVolume } from './volume-calculations';
import { getBaseline1RM, getMaxWeight } from './workout-utils';

/**
 * Interfaz para predicción de progreso
 */
export interface ProgressPrediction {
  nextWeekVolume: number;
  nextWeekWeight: number;
  monthlyGrowthRate: number;
  predictedPR: { weight: number; confidence: number };
  plateauRisk: number; // 0-100
  trendAnalysis: 'mejorando' | 'estable' | 'empeorando' | 'insuficiente';
  timeToNextPR: number; // En semanas
  confidenceLevel: number; // 0-100
  volumeTrend: number; // Tendencia semanal de volumen
  strengthTrend: number; // Tendencia semanal de fuerza
  recommendations: string[];
}

/**
 * Constantes de tiempo
 */
const TIME_CONSTANTS = {
  MS_PER_DAY: 24 * 60 * 60 * 1000
};

/**
 * Valida suficiencia de datos
 */
const validateDataSufficiency = (records: WorkoutRecord[]): {
  isValid: boolean;
  validRecords: WorkoutRecord[];
  hasTimeData: boolean;
  hasVolumeData: boolean;
  daysBetween: number;
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
} => {
  if (records.length < 3) {
    return {
      isValid: false,
      validRecords: [],
      hasTimeData: false,
      hasVolumeData: false,
      daysBetween: 0,
      experienceLevel: 'beginner'
    };
  }

  const validRecords = records.filter(r => r.weight > 0 && r.reps > 0 && r.sets > 0);

  if (validRecords.length < 3) {
    return {
      isValid: false,
      validRecords: [],
      hasTimeData: false,
      hasVolumeData: false,
      daysBetween: 0,
      experienceLevel: 'beginner'
    };
  }

  const sortedRecords = [...validRecords].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const firstDate = new Date(sortedRecords[0].date);
  const lastDate = new Date(sortedRecords[sortedRecords.length - 1].date);
  const daysBetween = Math.max(1, (lastDate.getTime() - firstDate.getTime()) / TIME_CONSTANTS.MS_PER_DAY);

  const hasTimeData = daysBetween >= 7;
  const hasVolumeData = validRecords.length >= 5;

  // Determinar nivel de experiencia basado en volumen y frecuencia
  const totalVolume = validRecords.reduce((sum, r) => sum + calculateVolume(r), 0);
  const avgVolume = totalVolume / validRecords.length;
  const workoutFrequency = validRecords.length / Math.max(1, daysBetween / 7);

  let experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  if (avgVolume > 2000 && workoutFrequency > 3) experienceLevel = 'advanced';
  else if (avgVolume > 1000 && workoutFrequency > 2) experienceLevel = 'intermediate';
  else experienceLevel = 'beginner';

  return {
    isValid: hasTimeData && hasVolumeData,
    validRecords,
    hasTimeData,
    hasVolumeData,
    daysBetween,
    experienceLevel
  };
};

/**
 * Calcula métricas básicas de los registros
 * Refactorizado para usar funciones centralizadas
 */
const calculateBasicMetrics = (validRecords: WorkoutRecord[]) => {
  // Usar función centralizada para calcular volumen
  const totalVolume = validRecords.reduce((sum, r) => sum + calculateVolume(r), 0);
  const avgWeight = validRecords.reduce((sum, r) => sum + r.weight, 0) / validRecords.length;
  const maxWeight = getMaxWeight(validRecords);
  const avgVolume = totalVolume / validRecords.length;

  // OPCIÓN A: Usar última semana completa (excluyendo semana actual)
  const lastCompleteWeekRecords = validRecords.filter(r => {
    const recordDate = new Date(r.date);
    const weekStart = startOfWeek(new Date(), { locale: es });
    const lastWeekStart = new Date(weekStart.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastWeekEnd = new Date(weekStart.getTime() - 24 * 60 * 60 * 1000);
    return recordDate >= lastWeekStart && recordDate <= lastWeekEnd;
  });

  let current1RMMax = 0;
  if (lastCompleteWeekRecords.length > 0) {
    current1RMMax = getBaseline1RM(lastCompleteWeekRecords);
  } else {
    current1RMMax = getBaseline1RM(validRecords);
  }

  return {
    totalVolume,
    avgWeight,
    maxWeight,
    avgVolume,
    current1RMMax
  };
};

/**
 * Calcula progreso general
 */
const calculateOverallProgress = (validRecords: WorkoutRecord[]) => {
  const sortedRecords = [...validRecords].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const firstHalf = sortedRecords.slice(0, Math.floor(sortedRecords.length / 2));
  const secondHalf = sortedRecords.slice(Math.floor(sortedRecords.length / 2));

  const firstHalfAvg = firstHalf.reduce((sum, r) => sum + r.weight, 0) / firstHalf.length;
  const secondHalfAvg = secondHalf.reduce((sum, r) => sum + r.weight, 0) / secondHalf.length;

  const overallProgress = firstHalfAvg > 0 ? ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100 : 0;

  return { overallProgress };
};

/**
 * Calcula tendencias de volumen y fuerza
 */
const calculateTrends = (validRecords: WorkoutRecord[]): { volumeTrend: number; strengthTrend: number; weeklyDataLength: number } => {
  const weeklyData = groupRecordsByWeek(validRecords);
  const weeklyDataLength = weeklyData.length;

  if (weeklyDataLength < 2) {
    return {
      volumeTrend: 0,
      strengthTrend: 0,
      weeklyDataLength: 0
    };
  }

  const volumes = weeklyData.map(w => w.volume);
  const weights = weeklyData.map(w => w.weight);

  const volumeTrend = calculateLinearTrend(volumes);
  const strengthTrend = calculateLinearTrend(weights);

  return {
    volumeTrend,
    strengthTrend,
    weeklyDataLength
  };
};

/**
 * Determina análisis de tendencia
 */
const determineTrendAnalysis = (
  validRecords: WorkoutRecord[],
  strengthTrend: number,
  volumeTrend: number
): 'mejorando' | 'estable' | 'empeorando' | 'insuficiente' => {
  if (validRecords.length < 7) return 'insuficiente';

  const strengthImproving = strengthTrend > 0.5;
  const volumeImproving = volumeTrend > 50;
  const strengthDeclining = strengthTrend < -0.5;
  const volumeDeclining = volumeTrend < -50;

  if (strengthImproving && volumeImproving) return 'mejorando';
  if (strengthDeclining && volumeDeclining) return 'empeorando';
  if (Math.abs(strengthTrend) < 0.5 && Math.abs(volumeTrend) < 50) return 'estable';
  if (strengthImproving || volumeImproving) return 'mejorando';
  if (strengthDeclining || volumeDeclining) return 'empeorando';

  return 'estable';
};

/**
 * Calcula nivel de confianza
 */
const calculateConfidenceLevel = (
  experienceLevel: 'beginner' | 'intermediate' | 'advanced',
  validRecords: WorkoutRecord[],
  weeklyDataLength: number
): number => {
  let baseConfidence = 0.5;

  // Factor por nivel de experiencia
  switch (experienceLevel) {
    case 'beginner':
      baseConfidence = 0.6;
      break;
    case 'intermediate':
      baseConfidence = 0.7;
      break;
    case 'advanced':
      baseConfidence = 0.8;
      break;
  }

  // Factor por cantidad de datos
  const dataFactor = Math.min(0.2, (validRecords.length / 50) * 0.2);
  baseConfidence += dataFactor;

  // Factor por consistencia temporal
  const consistencyFactor = Math.min(0.1, (weeklyDataLength / 12) * 0.1);
  baseConfidence += consistencyFactor;

  // Factor por calidad de datos (menos variabilidad = más confianza)
  const weights = validRecords.map(r => r.weight);
  const meanWeight = weights.reduce((sum, w) => sum + w, 0) / weights.length;
  const variance = weights.reduce((sum, w) => sum + Math.pow(w - meanWeight, 2), 0) / weights.length;
  const stdDev = Math.sqrt(variance);
  const cv = meanWeight > 0 ? stdDev / meanWeight : 0;
  const qualityFactor = Math.min(0.1, Math.max(0, 0.1 - cv * 0.1));
  baseConfidence += qualityFactor;

  // Usar función centralizada para validar rango
  return clamp(baseConfidence, 0.3, 0.9);
};

/**
 * Calcula predicciones para la próxima semana
 */
const calculateNextWeekPredictions = (
  strengthTrend: number,
  volumeTrend: number,
  avgVolume: number,
): { nextWeekWeight: number; nextWeekVolume: number } => {
  // Predicción conservadora basada en tendencias
  const nextWeekWeight = Math.max(0, avgVolume * (1 + strengthTrend * 0.01));
  const nextWeekVolume = Math.max(0, avgVolume * (1 + volumeTrend * 0.01));

  return {
    nextWeekWeight,
    nextWeekVolume
  };
};

/**
 * Calcula predicción de PR
 */
const calculatePRPrediction = (
  current1RMMax: number,
  strengthTrend: number,
  confidenceLevel: number
): { weight: number; confidence: number; timeToNextPR: number } => {
  // Predicción conservadora de PR
  const predictedWeight = current1RMMax * (1 + strengthTrend * 0.02);
  const confidence = clamp(confidenceLevel * 0.8, 0.3, 0.9);
  const timeToNextPR = strengthTrend > 0 ? Math.max(2, Math.min(12, 8 - strengthTrend * 2)) : 12;

  return {
    weight: predictedWeight,
    confidence,
    timeToNextPR
  };
};

/**
 * Calcula riesgo de meseta
 */
const calculatePlateauRisk = (
  experienceLevel: 'beginner' | 'intermediate' | 'advanced',
  validRecords: WorkoutRecord[],
  overallProgress: number,
  strengthTrend: number
): number => {
  let risk = 0;

  // Factor por nivel de experiencia
  switch (experienceLevel) {
    case 'beginner':
      risk += 10; // Principiantes tienen menor riesgo
      break;
    case 'intermediate':
      risk += 30;
      break;
    case 'advanced':
      risk += 50; // Avanzados tienen mayor riesgo
      break;
  }

  // Factor por progreso general
  if (overallProgress < 5) risk += 20;
  else if (overallProgress < 10) risk += 10;

  // Factor por tendencia de fuerza
  if (strengthTrend < 0) risk += 15;
  else if (strengthTrend < 0.5) risk += 5;

  // Factor por consistencia
  const recentRecords = validRecords.slice(-10);
  const recentProgress = recentRecords.length > 0 ?
    (recentRecords[recentRecords.length - 1].weight - recentRecords[0].weight) / recentRecords[0].weight * 100 : 0;

  if (recentProgress < 0) risk += 25;

  // Usar función centralizada para validar rango
  return clamp(risk, 0, 100);
};

/**
 * Genera recomendaciones
 */
const generateRecommendations = (
  trendAnalysis: 'mejorando' | 'estable' | 'empeorando' | 'insuficiente',
  weeklyDataLength: number,
  plateauRisk: number
): string[] => {
  const recommendations: string[] = [];

  switch (trendAnalysis) {
    case 'mejorando':
      recommendations.push('¡Excelente progreso! Mantén la consistencia');
      recommendations.push('Considera aumentar gradualmente la intensidad');
      break;
    case 'estable':
      recommendations.push('Progreso estable, evalúa si necesitas más desafío');
      if (plateauRisk > 50) {
        recommendations.push('Riesgo de meseta detectado - varía tu rutina');
      }
      break;
    case 'empeorando':
      recommendations.push('Revisa tu rutina y descanso');
      recommendations.push('Considera reducir volumen temporalmente');
      break;
    case 'insuficiente':
      recommendations.push('Necesitas más datos para análisis preciso');
      recommendations.push('Mantén consistencia en tus entrenamientos');
      break;
  }

  if (weeklyDataLength < 4) {
    recommendations.push('Más semanas de datos mejorarán las predicciones');
  }

  if (plateauRisk > 70) {
    recommendations.push('Alto riesgo de meseta - cambia tu rutina');
  }

  return recommendations;
};

/**
 * Valida y corrige predicciones
 */
const validateAndCorrectPredictions = (
  prediction: ProgressPrediction,
  basicMetrics: ReturnType<typeof calculateBasicMetrics>,
): ProgressPrediction => {
  // Validar que las predicciones sean realistas
  const maxReasonableVolume = basicMetrics.avgVolume * 1.5;
  const maxReasonableWeight = basicMetrics.maxWeight * 1.1;

  return {
    ...prediction,
    nextWeekVolume: clamp(prediction.nextWeekVolume, 0, maxReasonableVolume),
    nextWeekWeight: clamp(prediction.nextWeekWeight, 0, maxReasonableWeight),
    predictedPR: {
      weight: clamp(prediction.predictedPR.weight, basicMetrics.current1RMMax, basicMetrics.current1RMMax * 1.3),
      confidence: clamp(prediction.predictedPR.confidence, 0.3, 0.9)
    }
  };
};

/**
 * Agrupa registros por semana
 */
const groupRecordsByWeek = (records: WorkoutRecord[]): { volume: number; weight: number; date: Date }[] => {
  const weeklyData: { [key: string]: { volume: number; weight: number; count: number; date: Date } } = {};

  records.forEach(record => {
    const date = new Date(record.date);
    const weekStart = startOfWeek(date, { locale: es });
    const weekKey = weekStart.toISOString().split('T')[0];

    if (!weeklyData[weekKey]) {
      weeklyData[weekKey] = { volume: 0, weight: 0, count: 0, date: weekStart };
    }

    // Usar función centralizada para calcular volumen
    weeklyData[weekKey].volume += calculateVolume(record);
    weeklyData[weekKey].weight += record.weight;
    weeklyData[weekKey].count++;
  });

  return Object.values(weeklyData).map(week => ({
    volume: week.volume,
    weight: week.weight / week.count,
    date: week.date
  }));
};

/**
 * Calcula tendencia lineal
 */
const calculateLinearTrend = (values: number[]): number => {
  if (values.length < 2) return 0;

  const n = values.length;
  const xSum = values.reduce((sum, _, i) => sum + i, 0);
  const ySum = values.reduce((sum, val) => sum + val, 0);
  const xxSum = values.reduce((sum, _, i) => sum + i * i, 0);
  const xySum = values.reduce((sum, val, i) => sum + i * val, 0);

  const slope = (n * xySum - xSum * ySum) / (n * xxSum - xSum * xSum);
  return isNaN(slope) ? 0 : slope;
};

/**
 * Predice progreso basado en registros de entrenamiento
 * Refactorizado para usar funciones centralizadas
 */
export const predictProgress = (records: WorkoutRecord[]): ProgressPrediction => {
  const { isValid, validRecords, experienceLevel } = validateDataSufficiency(records);

  if (!isValid) {
    return {
      nextWeekVolume: 0,
      nextWeekWeight: 0,
      monthlyGrowthRate: 0,
      predictedPR: { weight: 0, confidence: 0 },
      plateauRisk: 0,
      trendAnalysis: 'insuficiente',
      timeToNextPR: 0,
      confidenceLevel: 0,
      volumeTrend: 0,
      strengthTrend: 0,
      recommendations: ['Datos insuficientes para predicción']
    };
  }

  const basicMetrics = calculateBasicMetrics(validRecords);
  const { overallProgress } = calculateOverallProgress(validRecords);
  const { volumeTrend, strengthTrend, weeklyDataLength } = calculateTrends(validRecords);
  const trendAnalysis = determineTrendAnalysis(validRecords, strengthTrend, volumeTrend);
  const confidenceLevel = calculateConfidenceLevel(experienceLevel, validRecords, weeklyDataLength);
  const { nextWeekWeight, nextWeekVolume } = calculateNextWeekPredictions(strengthTrend, volumeTrend, basicMetrics.avgVolume);
  const predictedPR = calculatePRPrediction(basicMetrics.current1RMMax, strengthTrend, confidenceLevel);
  const plateauRisk = calculatePlateauRisk(experienceLevel, validRecords, overallProgress, strengthTrend);
  const recommendations = generateRecommendations(trendAnalysis, weeklyDataLength, plateauRisk);

  const prediction: ProgressPrediction = {
    nextWeekVolume: roundToDecimals(nextWeekVolume),
    nextWeekWeight: roundToDecimals(nextWeekWeight),
    monthlyGrowthRate: roundToDecimals(strengthTrend * 4), // Estimación mensual
    predictedPR: {
      weight: roundToDecimals(predictedPR.weight),
      confidence: roundToDecimals(predictedPR.confidence)
    },
    plateauRisk: roundToDecimals(plateauRisk),
    trendAnalysis,
    timeToNextPR: roundToDecimals(predictedPR.timeToNextPR),
    confidenceLevel: roundToDecimals(confidenceLevel),
    volumeTrend: roundToDecimals(volumeTrend),
    strengthTrend: roundToDecimals(strengthTrend),
    recommendations
  };

  return validateAndCorrectPredictions(prediction, basicMetrics);
}; 