import { PROGRESS_CONSTANTS, TIME_CONSTANTS } from '@/constants/';
import type { WorkoutRecord } from '@/interfaces';
import { startOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import { calculateOptimal1RM } from './calculate-1rm.utils';
import { determineExperienceLevel } from './determine-experience-level.utils';
import { getValidSortedRecords } from './get-valid-sorted-records.utils';

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
 * Valida que hay suficientes datos para hacer predicciones confiables
 */
const validateDataSufficiency = (records: WorkoutRecord[]): {
  isValid: boolean;
  validRecords: WorkoutRecord[];
  hasTimeData: boolean;
  hasVolumeData: boolean;
  daysBetween: number;
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
} => {
  const validRecords = getValidSortedRecords(records);

  if (validRecords.length === 0) {
    return {
      isValid: false,
      validRecords: [],
      hasTimeData: false,
      hasVolumeData: false,
      daysBetween: 0,
      experienceLevel: 'beginner'
    };
  }

  const firstDate = validRecords[0].date;
  const lastDate = validRecords[validRecords.length - 1].date;
  const daysBetween = Math.max(1, (lastDate.getTime() - firstDate.getTime()) / TIME_CONSTANTS.MS_PER_DAY);

  const hasTimeData = daysBetween >= TIME_CONSTANTS.MIN_DAYS_FOR_ANALYSIS;
  const hasVolumeData = validRecords.length >= TIME_CONSTANTS.MIN_WORKOUTS_FOR_PREDICTIONS;
  const experienceLevel = determineExperienceLevel(validRecords);

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
 */
const calculateBasicMetrics = (validRecords: WorkoutRecord[]) => {
  const totalVolume = validRecords.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0);
  const avgWeight = validRecords.reduce((sum, r) => sum + r.weight, 0) / validRecords.length;
  const maxWeight = Math.max(...validRecords.map(r => r.weight));
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
    current1RMMax = Math.max(...lastCompleteWeekRecords.map(r => calculateOptimal1RM(r.weight, r.reps)));
  } else {
    current1RMMax = Math.max(...validRecords.map(r => calculateOptimal1RM(r.weight, r.reps)));
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
  let baseConfidence = 50;

  // Factor por experiencia
  switch (experienceLevel) {
    case 'beginner':
      baseConfidence += 10;
      break;
    case 'intermediate':
      baseConfidence += 20;
      break;
    case 'advanced':
      baseConfidence += 30;
      break;
  }

  // Factor por cantidad de datos
  if (weeklyDataLength >= 8) baseConfidence += 20;
  else if (weeklyDataLength >= 4) baseConfidence += 15;
  else if (weeklyDataLength >= 2) baseConfidence += 10;

  // Factor por consistencia
  const consistency = Math.min(100, (validRecords.length / 20) * 100);
  baseConfidence += consistency * 0.2;

  return Math.min(100, Math.max(0, baseConfidence));
};

/**
 * Calcula predicciones para próxima semana
 */
const calculateNextWeekPredictions = (
  strengthTrend: number,
  volumeTrend: number,
  avgVolume: number,
): { nextWeekWeight: number; nextWeekVolume: number } => {
  const nextWeekWeight = avgVolume + strengthTrend;
  const nextWeekVolume = avgVolume + volumeTrend;

  return {
    nextWeekWeight: Math.max(0, nextWeekWeight),
    nextWeekVolume: Math.max(0, nextWeekVolume)
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
  const predictedWeight = current1RMMax + (strengthTrend * 4); // 4 semanas
  const confidence = Math.min(100, confidenceLevel * 0.8);
  const timeToNextPR = strengthTrend > 0 ? Math.max(2, Math.min(12, 8 - strengthTrend * 2)) : 12;

  return {
    weight: Math.round(predictedWeight * 100) / 100,
    confidence: Math.round(confidence),
    timeToNextPR: Math.round(timeToNextPR)
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
  let risk = 20;

  // Factor por experiencia
  switch (experienceLevel) {
    case 'beginner':
      risk -= 10;
      break;
    case 'intermediate':
      risk += 10;
      break;
    case 'advanced':
      risk += 20;
      break;
  }

  // Factor por progreso
  if (overallProgress < 5) risk += 20;
  if (strengthTrend < 0) risk += 15;

  // Factor por tiempo de entrenamiento
  const weeksOfData = validRecords.length / 3;
  if (weeksOfData > 12) risk += 10;

  return Math.min(100, Math.max(0, risk));
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

  if (trendAnalysis === 'mejorando') {
    recommendations.push('¡Excelente progreso! Mantén la consistencia');
  } else if (trendAnalysis === 'estable') {
    recommendations.push('Progreso estable - considera aumentar intensidad gradualmente');
  } else if (trendAnalysis === 'empeorando') {
    recommendations.push('Revisa tu rutina - considera descanso o cambio de enfoque');
  } else {
    recommendations.push('Necesitas más datos para análisis preciso');
  }

  if (plateauRisk > 60) {
    recommendations.push('Riesgo de meseta alto - implementa periodización');
  }

  if (weeklyDataLength < 4) {
    recommendations.push('Más semanas de datos mejorarán la precisión');
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
  const corrected = { ...prediction };

  // Validar rangos razonables
  if (corrected.nextWeekWeight < 0) corrected.nextWeekWeight = basicMetrics.avgWeight;
  if (corrected.nextWeekVolume < 0) corrected.nextWeekVolume = basicMetrics.avgVolume;
  if (corrected.confidenceLevel > 100) corrected.confidenceLevel = 100;
  if (corrected.plateauRisk > 100) corrected.plateauRisk = 100;

  return corrected;
};

/**
 * Agrupa registros por semana
 */
const groupRecordsByWeek = (records: WorkoutRecord[]): { volume: number; weight: number; date: Date }[] => {
  const weekGroups = new Map<string, WorkoutRecord[]>();

  records.forEach(record => {
    const date = new Date(record.date);
    const weekStart = startOfWeek(date, { locale: es });
    const weekKey = weekStart.toISOString().split('T')[0];

    if (!weekGroups.has(weekKey)) {
      weekGroups.set(weekKey, []);
    }
    weekGroups.get(weekKey)!.push(record);
  });

  return Array.from(weekGroups.entries())
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .slice(-12)
    .map(([weekKey, weekRecords]) => {
      const volume = weekRecords.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0);
      const avg1RM = weekRecords.reduce((sum, r) => {
        const oneRM = calculateOptimal1RM(r.weight, r.reps);
        return sum + oneRM;
      }, 0) / weekRecords.length;

      return {
        volume,
        weight: avg1RM,
        date: new Date(weekKey)
      };
    });
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

  const denominator = (n * xxSum - xSum * xSum);
  if (denominator === 0) return 0;

  const slope = (n * xySum - xSum * ySum) / denominator;

  // Detectar si es tendencia de peso o volumen y aplicar límites
  const avgValue = ySum / n;
  const isWeightTrend = avgValue < 500;
  const maxTrend = isWeightTrend ? 2 : 100;

  return Math.max(-maxTrend, Math.min(maxTrend, slope));
};

/**
 * Predice progreso basado en registros de entrenamiento
 */
export const predictProgress = (records: WorkoutRecord[]): ProgressPrediction => {
  // Validación inicial
  if (records.length === 0) {
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
      recommendations: ['Comienza registrando tus entrenamientos para obtener predicciones']
    };
  }

  // Validar datos y obtener información básica
  const validation = validateDataSufficiency(records);

  if (validation.validRecords.length === 0) {
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
      recommendations: ['Revisa la calidad de los datos registrados']
    };
  }

  // Si no hay datos suficientes, usar valores conservadores
  if (!validation.isValid) {
    const basicMetrics = calculateBasicMetrics(validation.validRecords);

    return {
      nextWeekVolume: Math.round(basicMetrics.avgVolume * 1.02), // 2% conservador
      nextWeekWeight: Math.round((basicMetrics.avgWeight * 1.01) * 100) / 100, // 1% conservador
      monthlyGrowthRate: 2,
      predictedPR: { weight: Math.round((basicMetrics.maxWeight * 1.05) * 100) / 100, confidence: 30 },
      plateauRisk: 20,
      trendAnalysis: 'insuficiente',
      timeToNextPR: 8,
      confidenceLevel: 25,
      volumeTrend: Math.round(basicMetrics.avgVolume * 0.02),
      strengthTrend: Math.round((basicMetrics.avgWeight * 0.01) * 100) / 100,
      recommendations: [
        'Continúa registrando entrenamientos para obtener predicciones más precisas',
        'Mantén la consistencia en tu rutina durante al menos 2 semanas',
        'Enfócate en progresión gradual: 2.5-5% de aumento semanal'
      ]
    };
  }

  // Calcular métricas básicas usando funciones auxiliares
  const basicMetrics = calculateBasicMetrics(validation.validRecords);
  const overallProgressData = calculateOverallProgress(validation.validRecords);

  // Calcular tendencias usando la función auxiliar
  const trendsData = calculateTrends(validation.validRecords);

  // Determinar análisis de tendencia
  const trendAnalysis = determineTrendAnalysis(
    validation.validRecords,
    trendsData.strengthTrend,
    trendsData.volumeTrend
  );

  // Calcular nivel de confianza
  const confidenceLevel = calculateConfidenceLevel(
    validation.experienceLevel,
    validation.validRecords,
    trendsData.weeklyDataLength,
  );

  // Calcular predicciones para próxima semana
  const nextWeekPredictions = calculateNextWeekPredictions(
    trendsData.strengthTrend,
    trendsData.volumeTrend,
    basicMetrics.avgVolume,
  );

  // Calcular predicción de PR
  const prPrediction = calculatePRPrediction(
    basicMetrics.current1RMMax,
    trendsData.strengthTrend,
    confidenceLevel
  );

  // Calcular riesgo de meseta
  const plateauRisk = calculatePlateauRisk(
    validation.experienceLevel,
    validation.validRecords,
    overallProgressData.overallProgress,
    trendsData.strengthTrend
  );

  // Generar recomendaciones
  const recommendations = generateRecommendations(
    trendAnalysis,
    trendsData.weeklyDataLength,
    plateauRisk
  );

  // Ensamblar resultado final con validación de rangos
  const result: ProgressPrediction = {
    nextWeekVolume: Math.round(nextWeekPredictions.nextWeekVolume),
    nextWeekWeight: Math.round(nextWeekPredictions.nextWeekWeight * 100) / 100,
    monthlyGrowthRate: Math.max(-PROGRESS_CONSTANTS.MAX_MONTHLY_GROWTH,
      Math.min(PROGRESS_CONSTANTS.MAX_MONTHLY_GROWTH,
        Math.round((trendsData.strengthTrend * TIME_CONSTANTS.WEEKS_PER_MONTH) * 100) / 100)),
    predictedPR: prPrediction,
    plateauRisk: Math.round(plateauRisk),
    trendAnalysis,
    timeToNextPR: prPrediction.timeToNextPR,
    confidenceLevel: Math.round(confidenceLevel),
    volumeTrend: Math.round(trendsData.volumeTrend),
    strengthTrend: Math.round(trendsData.strengthTrend * 100) / 100,
    recommendations
  };

  // Validación final de coherencia
  const validatedResult = validateAndCorrectPredictions(result, basicMetrics);

  return validatedResult;
}; 