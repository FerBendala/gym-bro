import { differenceInDays, format } from 'date-fns';
import type { WorkoutRecord } from '../../interfaces';

/**
 * Utilidades genéricas para cálculos estadísticos y formateo
 * Reutilizable en ExerciseStats, Dashboard, Analytics, etc.
 */

/**
 * Formatea un número con el formato español y decimales opcionales
 */
export const formatNumber = (num: number, maxDecimals: number = 1): string => {
  return new Intl.NumberFormat('es-ES', {
    maximumFractionDigits: maxDecimals
  }).format(num);
};

/**
 * Calcula el promedio de un array de números
 */
export const calculateAverage = (numbers: number[]): number => {
  if (numbers.length === 0) return 0;
  return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
};

/**
 * Calcula el máximo de un array de números
 */
export const calculateMax = (numbers: number[]): number => {
  if (numbers.length === 0) return 0;
  return Math.max(...numbers);
};

/**
 * Calcula el mínimo de un array de números
 */
export const calculateMin = (numbers: number[]): number => {
  if (numbers.length === 0) return 0;
  return Math.min(...numbers);
};

/**
 * Calcula el elemento más frecuente en un array
 */
export const calculateMostFrequent = <T>(items: T[]): T | null => {
  if (items.length === 0) return null;

  const frequency = items.reduce((acc, item) => {
    const key = String(item);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const mostFrequent = Object.entries(frequency)
    .sort(([, a], [, b]) => b - a)[0];

  return mostFrequent ? (items.find(item => String(item) === mostFrequent[0]) || null) : null;
};

/**
 * Cuenta elementos únicos en un array basado en una función de mapeo
 */
export const countUniqueBy = <T>(items: T[], mapFn: (item: T) => string): number => {
  const uniqueValues = new Set(items.map(mapFn));
  return uniqueValues.size;
};

/**
 * Calcula días transcurridos desde una fecha
 */
export const getDaysAgo = (date: Date | null): string | null => {
  if (!date) return null;

  const days = differenceInDays(new Date(), date);
  if (days === 0) return 'Hoy';
  if (days === 1) return 'Ayer';
  return `Hace ${days} días`;
};

/**
 * Formatea una fecha como string para comparaciones
 */
export const formatDateForComparison = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

/**
 * Encuentra el registro más reciente en un array basado en fecha
 */
export const findMostRecent = <T extends { date: Date }>(records: T[]): T | null => {
  if (records.length === 0) return null;

  return records.reduce((most, current) =>
    current.date.getTime() > most.date.getTime() ? current : most
  );
};

/**
 * Calcula estadísticas básicas de una serie de números
 */
export const calculateBasicStats = (values: number[]) => {
  if (values.length === 0) {
    return { avg: 0, min: 0, max: 0, total: 0, count: 0 };
  }

  const total = values.reduce((sum, val) => sum + val, 0);
  const avg = total / values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);

  return { avg, min, max, total, count: values.length };
};

/**
 * Encuentra el valor más común en una serie
 */
export const findMostCommon = <T>(values: T[]): T | null => {
  if (values.length === 0) return null;

  const frequency = new Map<T, number>();
  values.forEach(val => {
    frequency.set(val, (frequency.get(val) || 0) + 1);
  });

  return Array.from(frequency.entries())
    .reduce((a, b) => a[1] > b[1] ? a : b)[0];
};

/**
 * Calcula el percentil especificado
 */
export const calculatePercentile = (values: number[], percentile: number): number => {
  if (values.length === 0) return 0;

  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
};

/**
 * Calcula el volumen de un entrenamiento (peso × reps × sets)
 * Si tiene series individuales, calcula el volumen exacto por serie
 */
export const calculateWorkoutVolume = (record: WorkoutRecord): number => {
  // Si tiene series individuales, calcular volumen exacto
  if (record.individualSets && record.individualSets.length > 0) {
    return record.individualSets.reduce((total, set) => {
      return total + (set.weight * set.reps);
    }, 0);
  }

  // Fallback al cálculo tradicional
  return record.weight * record.reps * record.sets;
};

/**
 * Calcula el volumen total de una lista de entrenamientos
 */
export const calculateTotalVolume = (records: WorkoutRecord[]): number => {
  return records.reduce((total, record) => total + calculateWorkoutVolume(record), 0);
};

/**
 * Calcula la intensidad promedio (peso promedio) de una lista de entrenamientos
 */
export const calculateAverageIntensity = (records: WorkoutRecord[]): number => {
  if (records.length === 0) return 0;
  const weights = records.map(record => record.weight);
  return calculateAverage(weights);
};

/**
 * Calcula el número total de repeticiones
 */
export const calculateTotalReps = (records: WorkoutRecord[]): number => {
  return records.reduce((total, record) => total + (record.reps * record.sets), 0);
};

/**
 * Calcula el número total de series
 */
export const calculateTotalSets = (records: WorkoutRecord[]): number => {
  return records.reduce((total, record) => total + record.sets, 0);
};

/**
 * Clasifica el volumen de entrenamiento en categorías
 */
export const classifyVolumeLevel = (volume: number): 'bajo' | 'moderado' | 'alto' | 'muy_alto' | 'extremo' => {
  if (volume < 100) return 'bajo';
  if (volume < 500) return 'moderado';
  if (volume < 1000) return 'alto';
  if (volume < 2000) return 'muy_alto';
  return 'extremo';
};

/**
 * Obtiene el color correspondiente a un nivel de volumen
 */
export const getVolumeColor = (volume: number): string => {
  const level = classifyVolumeLevel(volume);
  const colors = {
    bajo: 'text-gray-400',
    moderado: 'text-blue-400',
    alto: 'text-green-400',
    muy_alto: 'text-yellow-400',
    extremo: 'text-red-400'
  };
  return colors[level];
};

/**
 * Obtiene la etiqueta de texto para un nivel de volumen
 */
export const getVolumeLabel = (volume: number): string => {
  const level = classifyVolumeLevel(volume);
  const labels = {
    bajo: 'Volumen Bajo',
    moderado: 'Volumen Moderado',
    alto: 'Volumen Alto',
    muy_alto: 'Volumen Muy Alto',
    extremo: 'Volumen Extremo'
  };
  return labels[level];
};

/**
 * Calcula el progreso relativo entre dos valores
 */
export const calculateProgress = (oldValue: number, newValue: number): number => {
  if (oldValue === 0) return newValue > 0 ? 100 : 0;
  return ((newValue - oldValue) / oldValue) * 100;
};

/**
 * Calcula el 1RM estimado usando la fórmula de Epley
 * 1RM = peso × (1 + repeticiones/30)
 */
export const calculateEstimated1RM = (weight: number, reps: number): number => {
  if (weight === 0 || reps === 0) return 0;
  // Limitar repeticiones a máximo 20 para evitar estimaciones irreales
  const adjustedReps = Math.min(reps, 20);
  return weight * (1 + adjustedReps / 30);
};

/**
 * Calcula el índice de fuerza considerando peso, repeticiones y series
 * Combina 1RM estimado con el volumen total
 */
export const calculateStrengthIndex = (record: WorkoutRecord): number => {
  const oneRM = calculateEstimated1RM(record.weight, record.reps);
  const volume = calculateWorkoutVolume(record);

  // Combinar 1RM (70%) con volumen relativo (30%)
  // El volumen se normaliza dividiendo por series para evitar sesgo por número de series
  const normalizedVolume = volume / record.sets;
  return (oneRM * 0.7) + (normalizedVolume * 0.3);
};

/**
 * Calcula el progreso de fuerza considerando peso y repeticiones
 * Compara los índices de fuerza entre el primer y último registro
 */
export const calculateStrengthProgress = (firstRecord: WorkoutRecord, lastRecord: WorkoutRecord): {
  weightProgress: number;
  strengthProgress: number;
  oneRMProgress: number;
} => {
  // Usar 1RM estimado para weightProgress también (para consistencia)
  const first1RM = calculateEstimated1RM(firstRecord.weight, firstRecord.reps);
  const last1RM = calculateEstimated1RM(lastRecord.weight, lastRecord.reps);
  const weightProgress = calculateProgress(first1RM, last1RM);

  const firstStrengthIndex = calculateStrengthIndex(firstRecord);
  const lastStrengthIndex = calculateStrengthIndex(lastRecord);
  const strengthProgress = calculateProgress(firstStrengthIndex, lastStrengthIndex);

  const oneRMProgress = calculateProgress(first1RM, last1RM);

  return {
    weightProgress,
    strengthProgress,
    oneRMProgress
  };
};

/**
 * Calcula el promedio de índices de fuerza para una lista de registros
 */
export const calculateAverageStrengthIndex = (records: WorkoutRecord[]): number => {
  if (records.length === 0) return 0;
  const strengthIndices = records.map(record => calculateStrengthIndex(record));
  return calculateAverage(strengthIndices);
};

/**
 * Formatea un número como volumen (con separadores de miles)
 */
export const formatVolume = (volume: number): string => {
  return volume.toLocaleString('es-ES');
};

/**
 * Formatea la descripción de un entrenamiento mostrando series individuales si están disponibles
 */
export const formatWorkoutDescription = (record: WorkoutRecord): string => {
  // Si tiene series individuales, mostrar detalle por serie
  if (record.individualSets && record.individualSets.length > 0) {
    const seriesTexts = record.individualSets.map((set, index) =>
      `Serie ${index + 1}: ${set.weight}kg × ${set.reps}`
    );
    return seriesTexts.join(', ');
  }

  // Fallback al formato tradicional
  return `${record.weight}kg × ${record.reps} × ${record.sets}`;
};

/**
 * Obtiene el número total de series de un entrenamiento
 */
export const getTotalSets = (record: WorkoutRecord): number => {
  if (record.individualSets && record.individualSets.length > 0) {
    return record.individualSets.length;
  }
  return record.sets;
};

/**
 * Obtiene el número total de repeticiones de un entrenamiento
 */
export const getTotalReps = (record: WorkoutRecord): number => {
  if (record.individualSets && record.individualSets.length > 0) {
    return record.individualSets.reduce((total, set) => total + set.reps, 0);
  }
  return record.reps * record.sets;
};

// ==========================================
// ANÁLISIS AVANZADO DE PROGRESO DE FUERZA
// ==========================================

/**
 * Interfaz para análisis detallado de progreso de fuerza
 */
export interface AdvancedStrengthAnalysis {
  // Métricas básicas
  currentMax1RM: number;
  averageStrengthIndex: number;
  strengthVariability: number;

  // Progresión temporal
  overallProgress: {
    percentage: number;
    absolute: number;
    rate: 'slow' | 'moderate' | 'fast' | 'exceptional';
  };

  // Análisis de consistencia
  consistencyMetrics: {
    progressionConsistency: number; // 0-100
    plateauPeriods: number;
    breakthroughCount: number;
    volatilityIndex: number;
  };

  // Predicciones
  predictions: {
    next4WeeksPR: number;
    next12WeeksPR: number;
    plateauRisk: number; // 0-100
    timeToNextPR: number; // días
    confidence: number; // 0-100
  };

  // Análisis de curva de fuerza
  strengthCurve: {
    phase: 'novice' | 'intermediate' | 'advanced' | 'elite';
    gainRate: number; // kg por mes
    efficiency: number; // progreso vs esfuerzo
    potential: number; // % del máximo teórico alcanzado
  };

  // Recomendaciones específicas
  trainingRecommendations: {
    intensityZone: 'deload' | 'volume' | 'intensity' | 'peaking';
    suggestedRPE: number;
    volumeAdjustment: number; // % de cambio
    frequencyAdjustment: number; // entrenamientos por semana
    periodizationTip: string;
  };

  // Análisis por rangos de repeticiones
  repRangeAnalysis: {
    range: string;
    volume: number;
    maxWeight: number;
    progressRate: number;
    effectiveness: number; // 0-100
  }[];

  // Métricas de calidad
  qualityMetrics: {
    formConsistency: number; // basado en variabilidad
    loadProgression: number; // qué tan bien progresa la carga
    volumeOptimization: number; // eficiencia del volumen
    recoveryIndicators: number; // señales de recuperación
  };
}

/**
 * Calcula análisis avanzado de progreso de fuerza
 */
export const calculateAdvancedStrengthAnalysis = (records: WorkoutRecord[]): AdvancedStrengthAnalysis => {
  if (records.length < 5) {
    return createEmptyStrengthAnalysis();
  }

  const sortedRecords = [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Métricas básicas
  const currentMax1RM = Math.max(...records.map(r => calculateEstimated1RM(r.weight, r.reps)));
  const averageStrengthIndex = calculateAverageStrengthIndex(records);
  const strengthValues = records.map(r => calculateEstimated1RM(r.weight, r.reps));
  const strengthVariability = calculateCoefficientsOfVariation(strengthValues);

  // Progresión temporal
  const overallProgress = calculateOverallProgress(sortedRecords);

  // Análisis de consistencia
  const consistencyMetrics = analyzeProgressionConsistency(sortedRecords);

  // Predicciones
  const predictions = calculateStrengthPredictions(sortedRecords);

  // Análisis de curva de fuerza
  const strengthCurve = analyzeStrengthCurve(sortedRecords);

  // Recomendaciones de entrenamiento
  const trainingRecommendations = generateTrainingRecommendations(
    sortedRecords,
    predictions,
    strengthCurve
  );

  // Análisis por rangos de repeticiones
  const repRangeAnalysis = analyzeRepRanges(records);

  // Métricas de calidad
  const qualityMetrics = calculateQualityMetrics(sortedRecords);

  return {
    currentMax1RM,
    averageStrengthIndex,
    strengthVariability,
    overallProgress,
    consistencyMetrics,
    predictions,
    strengthCurve,
    trainingRecommendations,
    repRangeAnalysis,
    qualityMetrics
  };
};

/**
 * Crea un análisis de fuerza vacío para casos con datos insuficientes
 */
const createEmptyStrengthAnalysis = (): AdvancedStrengthAnalysis => ({
  currentMax1RM: 0,
  averageStrengthIndex: 0,
  strengthVariability: 0,
  overallProgress: {
    percentage: 0,
    absolute: 0,
    rate: 'slow'
  },
  consistencyMetrics: {
    progressionConsistency: 0,
    plateauPeriods: 0,
    breakthroughCount: 0,
    volatilityIndex: 0
  },
  predictions: {
    next4WeeksPR: 0,
    next12WeeksPR: 0,
    plateauRisk: 50,
    timeToNextPR: 0,
    confidence: 0
  },
  strengthCurve: {
    phase: 'novice',
    gainRate: 0,
    efficiency: 0,
    potential: 0
  },
  trainingRecommendations: {
    intensityZone: 'volume',
    suggestedRPE: 7,
    volumeAdjustment: 0,
    frequencyAdjustment: 3,
    periodizationTip: 'Necesitas más datos para recomendaciones precisas'
  },
  repRangeAnalysis: [],
  qualityMetrics: {
    formConsistency: 0,
    loadProgression: 0,
    volumeOptimization: 0,
    recoveryIndicators: 0
  }
});

/**
 * Calcula el coeficiente de variación para medir variabilidad
 */
const calculateCoefficientsOfVariation = (values: number[]): number => {
  if (values.length === 0) return 0;

  const mean = calculateAverage(values);
  if (mean === 0) return 0;

  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  return (stdDev / mean) * 100;
};

/**
 * Calcula progreso general considerando toda la serie temporal
 */
const calculateOverallProgress = (sortedRecords: WorkoutRecord[]): AdvancedStrengthAnalysis['overallProgress'] => {
  if (sortedRecords.length < 2) {
    return { percentage: 0, absolute: 0, rate: 'slow' };
  }

  const first1RM = calculateEstimated1RM(sortedRecords[0].weight, sortedRecords[0].reps);
  const last1RM = calculateEstimated1RM(
    sortedRecords[sortedRecords.length - 1].weight,
    sortedRecords[sortedRecords.length - 1].reps
  );

  const absolute = last1RM - first1RM;
  const percentage = first1RM > 0 ? (absolute / first1RM) * 100 : 0;

  // Calcular días transcurridos
  const firstDate = new Date(sortedRecords[0].date);
  const lastDate = new Date(sortedRecords[sortedRecords.length - 1].date);
  const daysPassed = differenceInDays(lastDate, firstDate);

  // Calcular tasa de ganancia por mes
  const monthlyGain = daysPassed > 0 ? (absolute / daysPassed) * 30 : 0;

  let rate: 'slow' | 'moderate' | 'fast' | 'exceptional';
  if (monthlyGain < 1) rate = 'slow';
  else if (monthlyGain < 3) rate = 'moderate';
  else if (monthlyGain < 6) rate = 'fast';
  else rate = 'exceptional';

  return {
    percentage: Math.round(percentage * 100) / 100,
    absolute: Math.round(absolute * 100) / 100,
    rate
  };
};

/**
 * Analiza la consistencia de la progresión
 */
const analyzeProgressionConsistency = (sortedRecords: WorkoutRecord[]): AdvancedStrengthAnalysis['consistencyMetrics'] => {
  if (sortedRecords.length < 5) {
    return {
      progressionConsistency: 0,
      plateauPeriods: 0,
      breakthroughCount: 0,
      volatilityIndex: 0
    };
  }

  const strengthValues = sortedRecords.map(r => calculateEstimated1RM(r.weight, r.reps));

  // Calcular progresión semana a semana
  const weeklyChanges: number[] = [];
  let plateauPeriods = 0;
  let breakthroughCount = 0;
  let currentPlateau = 0;

  for (let i = 1; i < strengthValues.length; i++) {
    const change = strengthValues[i] - strengthValues[i - 1];
    weeklyChanges.push(change);

    // Detectar mesetas (cambio < 1% por 3+ sesiones consecutivas)
    if (Math.abs(change) < strengthValues[i - 1] * 0.01) {
      currentPlateau++;
    } else {
      if (currentPlateau >= 3) {
        plateauPeriods++;
      }
      currentPlateau = 0;
    }

    // Detectar breakthroughs (mejora > 5%)
    if (change > strengthValues[i - 1] * 0.05) {
      breakthroughCount++;
    }
  }

  // Calcular consistencia (% de cambios positivos o neutrales)
  const positiveChanges = weeklyChanges.filter(change => change >= 0).length;
  const progressionConsistency = (positiveChanges / weeklyChanges.length) * 100;

  // Calcular volatilidad
  const volatilityIndex = calculateCoefficientsOfVariation(weeklyChanges);

  return {
    progressionConsistency: Math.round(progressionConsistency),
    plateauPeriods,
    breakthroughCount,
    volatilityIndex: Math.round(volatilityIndex)
  };
};

/**
 * Calcula predicciones de progreso futuro
 */
const calculateStrengthPredictions = (sortedRecords: WorkoutRecord[]): AdvancedStrengthAnalysis['predictions'] => {
  if (sortedRecords.length < 6) {
    return {
      next4WeeksPR: 0,
      next12WeeksPR: 0,
      plateauRisk: 50,
      timeToNextPR: 0,
      confidence: 0
    };
  }

  const strengthValues = sortedRecords.map(r => calculateEstimated1RM(r.weight, r.reps));
  const currentMax = Math.max(...strengthValues);

  // Calcular tendencia usando regresión lineal simple en las últimas 8 sesiones
  const recentValues = strengthValues.slice(-8);
  const trend = calculateLinearTrend(recentValues);

  // Predicciones con ajuste de realismo
  const next4WeeksPR = Math.max(currentMax, currentMax + (trend * 4 * 0.8)); // 80% del trend
  const next12WeeksPR = Math.max(currentMax, currentMax + (trend * 12 * 0.6)); // 60% del trend

  // Calcular riesgo de meseta basado en variabilidad reciente
  const recentVariability = calculateCoefficientsOfVariation(recentValues);
  const plateauRisk = Math.min(90, Math.max(10, 50 + (30 - recentVariability)));

  // Estimar tiempo hasta próximo PR (mejora de 2.5%)
  const targetPR = currentMax * 1.025;
  const timeToNextPR = trend > 0 ? Math.ceil((targetPR - currentMax) / trend) : 0;

  // Calcular confianza basada en consistencia de datos
  const confidence = Math.min(95, Math.max(20, 100 - recentVariability));

  return {
    next4WeeksPR: Math.round(next4WeeksPR * 100) / 100,
    next12WeeksPR: Math.round(next12WeeksPR * 100) / 100,
    plateauRisk: Math.round(plateauRisk),
    timeToNextPR: Math.max(0, timeToNextPR),
    confidence: Math.round(confidence)
  };
};

/**
 * Calcula tendencia lineal simple
 */
const calculateLinearTrend = (values: number[]): number => {
  if (values.length < 2) return 0;

  const n = values.length;
  const xSum = values.reduce((sum, _, i) => sum + i, 0);
  const ySum = values.reduce((sum, val) => sum + val, 0);
  const xxSum = values.reduce((sum, _, i) => sum + i * i, 0);
  const xySum = values.reduce((sum, val, i) => sum + i * val, 0);

  return (n * xySum - xSum * ySum) / (n * xxSum - xSum * xSum);
};

/**
 * Analiza la curva de fuerza y determina la fase de entrenamiento
 */
const analyzeStrengthCurve = (sortedRecords: WorkoutRecord[]): AdvancedStrengthAnalysis['strengthCurve'] => {
  if (sortedRecords.length < 8) {
    return {
      phase: 'novice',
      gainRate: 0,
      efficiency: 0,
      potential: 0
    };
  }

  const strengthValues = sortedRecords.map(r => calculateEstimated1RM(r.weight, r.reps));
  const overallProgress = calculateOverallProgress(sortedRecords);
  const monthlyGainRate = overallProgress.absolute /
    (differenceInDays(new Date(sortedRecords[sortedRecords.length - 1].date), new Date(sortedRecords[0].date)) / 30);

  // Determinar fase basada en tasa de ganancia
  let phase: 'novice' | 'intermediate' | 'advanced' | 'elite';
  if (monthlyGainRate > 4) phase = 'novice';
  else if (monthlyGainRate > 2) phase = 'intermediate';
  else if (monthlyGainRate > 0.5) phase = 'advanced';
  else phase = 'elite';

  // Calcular eficiencia (progreso vs volumen total)
  const totalVolume = calculateTotalVolume(sortedRecords);
  const efficiency = totalVolume > 0 ? (overallProgress.absolute / totalVolume) * 1000 : 0;

  // Estimar potencial alcanzado (basado en normalizaciones por peso corporal - simplificado)
  const currentMax = Math.max(...strengthValues);
  const estimatedPotential = currentMax / 2; // Simplificado - normalmente se usa peso corporal
  const potential = Math.min(100, (currentMax / (currentMax + estimatedPotential)) * 100);

  return {
    phase,
    gainRate: Math.round(monthlyGainRate * 100) / 100,
    efficiency: Math.round(efficiency * 100) / 100,
    potential: Math.round(potential)
  };
};

/**
 * Genera recomendaciones de entrenamiento basadas en el análisis
 */
const generateTrainingRecommendations = (
  sortedRecords: WorkoutRecord[],
  predictions: AdvancedStrengthAnalysis['predictions'],
  strengthCurve: AdvancedStrengthAnalysis['strengthCurve']
): AdvancedStrengthAnalysis['trainingRecommendations'] => {
  // Determinar zona de intensidad basada en fase y riesgo de meseta
  let intensityZone: 'deload' | 'volume' | 'intensity' | 'peaking';
  let suggestedRPE: number;
  let volumeAdjustment: number;
  let frequencyAdjustment: number;
  let periodizationTip: string;

  if (predictions.plateauRisk > 70) {
    intensityZone = 'deload';
    suggestedRPE = 6;
    volumeAdjustment = -30;
    frequencyAdjustment = 2;
    periodizationTip = 'Semana de descarga - reduce volumen e intensidad';
  } else if (strengthCurve.phase === 'novice') {
    intensityZone = 'volume';
    suggestedRPE = 7;
    volumeAdjustment = 10;
    frequencyAdjustment = 4;
    periodizationTip = 'Enfócate en volumen y técnica - progresión lineal';
  } else if (strengthCurve.phase === 'intermediate') {
    intensityZone = 'intensity';
    suggestedRPE = 8;
    volumeAdjustment = 0;
    frequencyAdjustment = 3;
    periodizationTip = 'Periodización ondulante - varía intensidad semanalmente';
  } else {
    intensityZone = 'peaking';
    suggestedRPE = 9;
    volumeAdjustment = -20;
    frequencyAdjustment = 3;
    periodizationTip = 'Periodización en bloque - especialización e intensidad';
  }

  return {
    intensityZone,
    suggestedRPE,
    volumeAdjustment,
    frequencyAdjustment,
    periodizationTip
  };
};

/**
 * Analiza efectividad por rangos de repeticiones
 */
const analyzeRepRanges = (records: WorkoutRecord[]): AdvancedStrengthAnalysis['repRangeAnalysis'] => {
  const ranges = [
    { min: 1, max: 3, name: '1-3 (Fuerza)' },
    { min: 4, max: 6, name: '4-6 (Fuerza-Potencia)' },
    { min: 7, max: 10, name: '7-10 (Hipertrofia-Fuerza)' },
    { min: 11, max: 15, name: '11-15 (Hipertrofia)' },
    { min: 16, max: 25, name: '16+ (Resistencia)' }
  ];

  return ranges.map(range => {
    const rangeRecords = records.filter(r => r.reps >= range.min && r.reps <= range.max);

    if (rangeRecords.length === 0) {
      return {
        range: range.name,
        volume: 0,
        maxWeight: 0,
        progressRate: 0,
        effectiveness: 0
      };
    }

    const volume = calculateTotalVolume(rangeRecords);
    const maxWeight = Math.max(...rangeRecords.map(r => r.weight));

    // Calcular tasa de progreso en este rango
    const sortedRangeRecords = [...rangeRecords].sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const progressRate = sortedRangeRecords.length > 1 ?
      calculateProgress(
        calculateEstimated1RM(sortedRangeRecords[0].weight, sortedRangeRecords[0].reps),
        calculateEstimated1RM(
          sortedRangeRecords[sortedRangeRecords.length - 1].weight,
          sortedRangeRecords[sortedRangeRecords.length - 1].reps
        )
      ) : 0;

    // Calcular efectividad (progreso por unidad de volumen)
    const effectiveness = volume > 0 ? Math.max(0, progressRate / (volume / 1000)) : 0;

    return {
      range: range.name,
      volume: Math.round(volume),
      maxWeight: Math.round(maxWeight * 100) / 100,
      progressRate: Math.round(progressRate * 100) / 100,
      effectiveness: Math.round(effectiveness * 100) / 100
    };
  }).filter(analysis => analysis.volume > 0);
};

/**
 * Calcula métricas de calidad del entrenamiento
 */
const calculateQualityMetrics = (sortedRecords: WorkoutRecord[]): AdvancedStrengthAnalysis['qualityMetrics'] => {
  if (sortedRecords.length < 4) {
    return {
      formConsistency: 0,
      loadProgression: 0,
      volumeOptimization: 0,
      recoveryIndicators: 0
    };
  }

  // Consistencia de forma (basada en variabilidad de repeticiones)
  const repsValues = sortedRecords.map(r => r.reps);
  const repsVariability = calculateCoefficientsOfVariation(repsValues);
  const formConsistency = Math.max(0, 100 - repsVariability);

  // Progresión de carga (tendencia de pesos)
  const weights = sortedRecords.map(r => r.weight);
  const weightTrend = calculateLinearTrend(weights);
  const loadProgression = Math.min(100, Math.max(0, weightTrend * 10));

  // Optimización de volumen (relación volumen/progreso)
  const volumeValues = sortedRecords.map(r => calculateWorkoutVolume(r));
  const strengthValues = sortedRecords.map(r => calculateEstimated1RM(r.weight, r.reps));

  const avgVolume = calculateAverage(volumeValues);
  const avgStrength = calculateAverage(strengthValues);
  const volumeOptimization = avgVolume > 0 ? Math.min(100, (avgStrength / avgVolume) * 100) : 0;

  // Indicadores de recuperación (basado en progresión después de descansos)
  let recoveryScore = 50; // Base neutral

  // Analizar patrones de recuperación sería más complejo y requeriría datos de descanso
  // Por ahora, usamos la consistencia de progresión como proxy
  const consistencyMetrics = analyzeProgressionConsistency(sortedRecords);
  const recoveryIndicators = consistencyMetrics.progressionConsistency;

  return {
    formConsistency: Math.round(formConsistency),
    loadProgression: Math.round(loadProgression),
    volumeOptimization: Math.round(volumeOptimization),
    recoveryIndicators: Math.round(recoveryIndicators)
  };
};

// ==========================================
// ALGORITMOS MEJORADOS DE PREDICCIÓN
// ==========================================

/**
 * Interfaz para predicciones mejoradas de 1RM
 */
export interface Enhanced1RMPrediction {
  // Predicciones básicas
  current1RM: number;
  predicted1RMIn4Weeks: number;
  predicted1RMIn12Weeks: number;
  predicted1RMIn6Months: number;

  // Métricas de confianza
  predictionConfidence: number; // 0-100
  dataQuality: number; // 0-100
  modelReliability: number; // 0-100

  // Análisis de tendencias
  shortTermTrend: number; // pendiente últimas 4 semanas
  mediumTermTrend: number; // pendiente últimas 12 semanas
  longTermTrend: number; // pendiente últimos 6 meses
  accelerationFactor: number; // cambio en la velocidad de progreso

  // Factores limitantes
  plateauProbability: number; // 0-100
  overtrainingRisk: number; // 0-100
  injuryRisk: number; // 0-100 basado en progresión agresiva

  // Escenarios de predicción
  conservativeScenario: number; // predicción pesimista
  realisticScenario: number; // predicción más probable
  optimisticScenario: number; // predicción optimista

  // Recomendaciones específicas
  optimalTrainingFrequency: number;
  recommendedRepRanges: string[];
  periodizationStrategy: string;
  nextMilestone: { weight: number; timeframe: string };
}

/**
 * Calcula predicciones mejoradas de 1RM con múltiples algoritmos
 */
export const calculateEnhanced1RMPrediction = (records: WorkoutRecord[]): Enhanced1RMPrediction => {
  if (records.length < 6) {
    return createEmpty1RMPrediction();
  }

  const sortedRecords = [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Calcular 1RM actual
  const current1RM = Math.max(...records.map(r => calculateEstimated1RM(r.weight, r.reps)));

  // Analizar tendencias en diferentes períodos
  const trends = analyzeTrendPeriods(sortedRecords);

  // Calcular métricas de calidad de datos
  const dataQuality = assessDataQuality(sortedRecords);

  // Predicciones usando diferentes métodos
  const linearPredictions = calculateLinearPredictions(sortedRecords, current1RM);
  const exponentialPredictions = calculateExponentialPredictions(sortedRecords, current1RM);
  const seasonalPredictions = calculateSeasonalPredictions(sortedRecords, current1RM);

  // Combinar predicciones con pesos basados en calidad de datos
  const predictions = combineRredictions(linearPredictions, exponentialPredictions, seasonalPredictions, dataQuality);

  // Evaluar factores de riesgo
  const riskFactors = assessRiskFactors(sortedRecords, trends);

  // Generar escenarios
  const scenarios = generatePredictionScenarios(predictions, riskFactors);

  // Calcular confianza general
  const predictionConfidence = calculatePredictionConfidence(dataQuality, trends, riskFactors);

  // Generar recomendaciones
  const recommendations = generateTrainingRecommendations1RM(trends, riskFactors, current1RM);

  return {
    current1RM,
    predicted1RMIn4Weeks: predictions.fourWeeks,
    predicted1RMIn12Weeks: predictions.twelveWeeks,
    predicted1RMIn6Months: predictions.sixMonths,
    predictionConfidence,
    dataQuality: dataQuality.overall,
    modelReliability: calculateModelReliability(trends),
    shortTermTrend: trends.shortTerm,
    mediumTermTrend: trends.mediumTerm,
    longTermTrend: trends.longTerm,
    accelerationFactor: trends.acceleration,
    plateauProbability: riskFactors.plateauRisk,
    overtrainingRisk: riskFactors.overtrainingRisk,
    injuryRisk: riskFactors.injuryRisk,
    conservativeScenario: scenarios.conservative,
    realisticScenario: scenarios.realistic,
    optimisticScenario: scenarios.optimistic,
    optimalTrainingFrequency: recommendations.frequency,
    recommendedRepRanges: recommendations.repRanges,
    periodizationStrategy: recommendations.periodization,
    nextMilestone: recommendations.milestone
  };
};

/**
 * Crea predicción vacía para casos con datos insuficientes
 */
const createEmpty1RMPrediction = (): Enhanced1RMPrediction => ({
  current1RM: 0,
  predicted1RMIn4Weeks: 0,
  predicted1RMIn12Weeks: 0,
  predicted1RMIn6Months: 0,
  predictionConfidence: 0,
  dataQuality: 0,
  modelReliability: 0,
  shortTermTrend: 0,
  mediumTermTrend: 0,
  longTermTrend: 0,
  accelerationFactor: 0,
  plateauProbability: 50,
  overtrainingRisk: 0,
  injuryRisk: 0,
  conservativeScenario: 0,
  realisticScenario: 0,
  optimisticScenario: 0,
  optimalTrainingFrequency: 3,
  recommendedRepRanges: ['6-8'],
  periodizationStrategy: 'linear',
  nextMilestone: { weight: 0, timeframe: 'Datos insuficientes' }
});

/**
 * Analiza tendencias en diferentes períodos temporales
 */
const analyzeTrendPeriods = (sortedRecords: WorkoutRecord[]) => {
  const strengthValues = sortedRecords.map(r => calculateEstimated1RM(r.weight, r.reps));

  // Análisis por períodos
  const shortTermValues = strengthValues.slice(-8); // Últimos 8 registros
  const mediumTermValues = strengthValues.slice(-16); // Últimos 16 registros
  const longTermValues = strengthValues; // Todos los registros

  const shortTerm = calculateLinearTrend(shortTermValues);
  const mediumTerm = calculateLinearTrend(mediumTermValues);
  const longTerm = calculateLinearTrend(longTermValues);

  // Calcular factor de aceleración (cambio en la velocidad de progreso)
  const recentTrend = shortTerm;
  const historicalTrend = longTerm;
  const acceleration = recentTrend - historicalTrend;

  return {
    shortTerm,
    mediumTerm,
    longTerm,
    acceleration
  };
};

/**
 * Evalúa la calidad de los datos para predicción
 */
const assessDataQuality = (sortedRecords: WorkoutRecord[]) => {
  // Consistencia temporal (regularidad de entrenamientos)
  const dates = sortedRecords.map(r => new Date(r.date));
  const intervals = [];
  for (let i = 1; i < dates.length; i++) {
    const daysDiff = (dates[i].getTime() - dates[i - 1].getTime()) / (1000 * 60 * 60 * 24);
    intervals.push(daysDiff);
  }

  const avgInterval = intervals.reduce((sum, int) => sum + int, 0) / intervals.length;
  const intervalVariability = calculateCoefficientsOfVariation(intervals);
  const temporalConsistency = Math.max(0, 100 - intervalVariability);

  // Variabilidad de datos (estabilidad de rendimiento)
  const strengthValues = sortedRecords.map(r => calculateEstimated1RM(r.weight, r.reps));
  const dataVariability = calculateCoefficientsOfVariation(strengthValues);
  const dataStability = Math.max(0, 100 - dataVariability);

  // Completitud de datos (cantidad de registros)
  const dataCompleteness = Math.min(100, (sortedRecords.length / 20) * 100); // 20 registros = 100%

  // Rango de datos (diversidad de pesos y repeticiones)
  const weights = sortedRecords.map(r => r.weight);
  const reps = sortedRecords.map(r => r.reps);
  const weightRange = (Math.max(...weights) - Math.min(...weights)) / Math.max(...weights) * 100;
  const repRange = (Math.max(...reps) - Math.min(...reps)) / Math.max(...reps) * 100;
  const dataDiversity = (weightRange + repRange) / 2;

  const overall = (temporalConsistency * 0.3 + dataStability * 0.3 + dataCompleteness * 0.25 + dataDiversity * 0.15);

  return {
    temporalConsistency: Math.round(temporalConsistency),
    dataStability: Math.round(dataStability),
    dataCompleteness: Math.round(dataCompleteness),
    dataDiversity: Math.round(dataDiversity),
    overall: Math.round(overall)
  };
};

/**
 * Calcula predicciones usando regresión lineal
 */
const calculateLinearPredictions = (sortedRecords: WorkoutRecord[], current1RM: number) => {
  const strengthValues = sortedRecords.map(r => calculateEstimated1RM(r.weight, r.reps));
  const trend = calculateLinearTrend(strengthValues);

  return {
    fourWeeks: Math.max(current1RM, current1RM + (trend * 4)),
    twelveWeeks: Math.max(current1RM, current1RM + (trend * 12)),
    sixMonths: Math.max(current1RM, current1RM + (trend * 24))
  };
};

/**
 * Calcula predicciones usando modelo exponencial
 */
const calculateExponentialPredictions = (sortedRecords: WorkoutRecord[], current1RM: number) => {
  const strengthValues = sortedRecords.map(r => calculateEstimated1RM(r.weight, r.reps));

  // Calcular tasa de crecimiento exponencial
  if (strengthValues.length < 4) {
    return calculateLinearPredictions(sortedRecords, current1RM);
  }

  const firstValue = strengthValues[0];
  const lastValue = strengthValues[strengthValues.length - 1];
  const periods = strengthValues.length - 1;

  if (firstValue <= 0 || lastValue <= 0) {
    return calculateLinearPredictions(sortedRecords, current1RM);
  }

  const growthRate = Math.pow(lastValue / firstValue, 1 / periods) - 1;

  // Aplicar decaimiento exponencial para predicciones a largo plazo
  const decayFactor = 0.8; // Reducir tasa de crecimiento con el tiempo

  return {
    fourWeeks: Math.max(current1RM, current1RM * Math.pow(1 + growthRate, 4)),
    twelveWeeks: Math.max(current1RM, current1RM * Math.pow(1 + growthRate * decayFactor, 12)),
    sixMonths: Math.max(current1RM, current1RM * Math.pow(1 + growthRate * Math.pow(decayFactor, 2), 24))
  };
};

/**
 * Calcula predicciones considerando patrones estacionales
 */
const calculateSeasonalPredictions = (sortedRecords: WorkoutRecord[], current1RM: number) => {
  // Por ahora, usar predicciones lineales con ajuste estacional
  const linearPreds = calculateLinearPredictions(sortedRecords, current1RM);

  // Análisis de variaciones mensuales (simplificado)
  const monthlyVariations = analyzeMonthlyVariations(sortedRecords);
  const seasonalAdjustment = monthlyVariations.averageVariation;

  return {
    fourWeeks: linearPreds.fourWeeks * (1 + seasonalAdjustment * 0.1),
    twelveWeeks: linearPreds.twelveWeeks * (1 + seasonalAdjustment * 0.2),
    sixMonths: linearPreds.sixMonths * (1 + seasonalAdjustment * 0.3)
  };
};

/**
 * Analiza variaciones mensuales en el rendimiento
 */
const analyzeMonthlyVariations = (sortedRecords: WorkoutRecord[]) => {
  const monthlyPerformance: Record<string, number[]> = {};

  sortedRecords.forEach(record => {
    const month = new Date(record.date).getMonth();
    const strength = calculateEstimated1RM(record.weight, record.reps);

    if (!monthlyPerformance[month]) {
      monthlyPerformance[month] = [];
    }
    monthlyPerformance[month].push(strength);
  });

  const monthlyAverages = Object.entries(monthlyPerformance).map(([month, values]) => ({
    month: parseInt(month),
    average: values.reduce((sum, val) => sum + val, 0) / values.length
  }));

  if (monthlyAverages.length < 2) {
    return { averageVariation: 0, bestMonth: 0, worstMonth: 0 };
  }

  const overallAverage = monthlyAverages.reduce((sum, m) => sum + m.average, 0) / monthlyAverages.length;
  const variations = monthlyAverages.map(m => (m.average - overallAverage) / overallAverage);
  const averageVariation = variations.reduce((sum, v) => sum + v, 0) / variations.length;

  const bestMonth = monthlyAverages.reduce((best, current) =>
    current.average > best.average ? current : best
  ).month;

  const worstMonth = monthlyAverages.reduce((worst, current) =>
    current.average < worst.average ? current : worst
  ).month;

  return { averageVariation, bestMonth, worstMonth };
};

/**
 * Combina diferentes predicciones con pesos apropiados
 */
const combineRredictions = (linear: any, exponential: any, seasonal: any, dataQuality: any) => {
  // Pesos basados en calidad de datos
  const linearWeight = 0.4 + (dataQuality.temporalConsistency / 100) * 0.2;
  const exponentialWeight = 0.3 + (dataQuality.dataStability / 100) * 0.2;
  const seasonalWeight = 0.3 + (dataQuality.dataCompleteness / 100) * 0.1;

  const totalWeight = linearWeight + exponentialWeight + seasonalWeight;

  return {
    fourWeeks: Math.round(
      (linear.fourWeeks * linearWeight +
        exponential.fourWeeks * exponentialWeight +
        seasonal.fourWeeks * seasonalWeight) / totalWeight * 100
    ) / 100,
    twelveWeeks: Math.round(
      (linear.twelveWeeks * linearWeight +
        exponential.twelveWeeks * exponentialWeight +
        seasonal.twelveWeeks * seasonalWeight) / totalWeight * 100
    ) / 100,
    sixMonths: Math.round(
      (linear.sixMonths * linearWeight +
        exponential.sixMonths * exponentialWeight +
        seasonal.sixMonths * seasonalWeight) / totalWeight * 100
    ) / 100
  };
};

/**
 * Evalúa factores de riesgo para las predicciones
 */
const assessRiskFactors = (sortedRecords: WorkoutRecord[], trends: any) => {
  // Riesgo de meseta basado en tendencia reciente
  const plateauRisk = trends.shortTerm < 0.1 ? 80 : Math.max(10, 50 - (trends.shortTerm * 20));

  // Riesgo de sobreentrenamiento basado en aceleración excesiva
  const overtrainingRisk = trends.acceleration > 2 ? 70 : Math.max(10, trends.acceleration * 25);

  // Riesgo de lesión basado en progresión agresiva
  const recentProgression = trends.shortTerm;
  const injuryRisk = recentProgression > 3 ? 60 : Math.max(5, recentProgression * 15);

  return {
    plateauRisk: Math.round(plateauRisk),
    overtrainingRisk: Math.round(overtrainingRisk),
    injuryRisk: Math.round(injuryRisk)
  };
};

/**
 * Genera escenarios de predicción conservador, realista y optimista
 */
const generatePredictionScenarios = (predictions: any, riskFactors: any) => {
  // Factores de ajuste basados en riesgos
  const conservativeFactor = 0.7 + (riskFactors.plateauRisk / 100) * 0.2;
  const optimisticFactor = 1.3 - (riskFactors.plateauRisk / 100) * 0.2;

  return {
    conservative: Math.round(predictions.twelveWeeks * conservativeFactor * 100) / 100,
    realistic: predictions.twelveWeeks,
    optimistic: Math.round(predictions.twelveWeeks * optimisticFactor * 100) / 100
  };
};

/**
 * Calcula confianza general de la predicción
 */
const calculatePredictionConfidence = (dataQuality: any, trends: any, riskFactors: any) => {
  // Factores positivos
  const dataQualityScore = dataQuality.overall;
  const trendConsistency = Math.abs(trends.shortTerm - trends.longTerm) < 1 ? 80 : 50;

  // Factores negativos
  const riskPenalty = (riskFactors.plateauRisk + riskFactors.overtrainingRisk + riskFactors.injuryRisk) / 3;

  const confidence = (dataQualityScore * 0.4 + trendConsistency * 0.4) - (riskPenalty * 0.2);

  return Math.round(Math.max(10, Math.min(95, confidence)));
};

/**
 * Calcula confiabilidad del modelo
 */
const calculateModelReliability = (trends: any) => {
  // Basado en consistencia de tendencias
  const trendConsistency = 1 - Math.abs(trends.shortTerm - trends.longTerm) / Math.max(Math.abs(trends.shortTerm), Math.abs(trends.longTerm), 1);
  return Math.round(Math.max(20, Math.min(95, trendConsistency * 100)));
};

/**
 * Genera recomendaciones específicas para 1RM
 */
const generateTrainingRecommendations1RM = (trends: any, riskFactors: any, current1RM: number) => {
  // Frecuencia óptima basada en fase y riesgos
  let frequency = 3;
  if (riskFactors.overtrainingRisk > 60) frequency = 2;
  else if (trends.shortTerm > 2) frequency = 4;

  // Rangos de repeticiones recomendados
  let repRanges = ['6-8'];
  if (current1RM < 50) repRanges = ['8-12', '6-8'];
  else if (current1RM > 100) repRanges = ['3-5', '6-8'];

  // Estrategia de periodización
  let periodization = 'linear';
  if (riskFactors.plateauRisk > 60) periodization = 'ondulante';
  else if (current1RM > 100) periodization = 'bloque';

  // Próximo hito
  const nextMilestone = {
    weight: Math.ceil(current1RM / 10) * 10 + 10, // Próximo múltiplo de 10
    timeframe: trends.shortTerm > 1 ? '6-8 semanas' : '10-12 semanas'
  };

  return {
    frequency,
    repRanges,
    periodization,
    milestone: nextMilestone
  };
};

/**
 * Calcula el crecimiento total entre períodos usando múltiples semanas para mayor robustez
 * @param timelineData Array de datos de timeline con propiedades value y totalWorkouts
 * @returns Objeto con crecimiento absoluto y porcentual
 */
export const calculateTotalGrowth = (timelineData: Array<{ value: number; totalWorkouts: number }>): {
  absoluteGrowth: number;
  percentGrowth: number;
} => {
  // Validar datos mínimos
  if (timelineData.length <= 2) {
    return { absoluteGrowth: 0, percentGrowth: 0 };
  }

  // Usar primeras 2-3 semanas vs últimas 2-3 semanas para mayor estabilidad
  const firstPeriodSize = Math.min(3, Math.floor(timelineData.length / 3));
  const lastPeriodSize = Math.min(3, Math.floor(timelineData.length / 3));

  const firstPeriod = timelineData.slice(0, firstPeriodSize);
  const lastPeriod = timelineData.slice(-lastPeriodSize);

  // Calcular volumen promedio por sesión para cada período
  const firstPeriodAvg = firstPeriod.reduce((sum, week) => {
    const avgVol = week.totalWorkouts > 0 ? week.value / week.totalWorkouts : 0;
    return sum + avgVol;
  }, 0) / firstPeriod.length;

  const lastPeriodAvg = lastPeriod.reduce((sum, week) => {
    const avgVol = week.totalWorkouts > 0 ? week.value / week.totalWorkouts : 0;
    return sum + avgVol;
  }, 0) / lastPeriod.length;

  const absoluteGrowth = lastPeriodAvg - firstPeriodAvg;

  // Calcular porcentaje con validación
  if (firstPeriodAvg <= 0) {
    return { absoluteGrowth, percentGrowth: 0 };
  }

  const rawPercentGrowth = (absoluteGrowth / firstPeriodAvg) * 100;

  // Limitar crecimiento a un rango razonable (-90% a +200%)
  const percentGrowth = Math.max(-90, Math.min(200, rawPercentGrowth));

  return { absoluteGrowth, percentGrowth };
};

/**
 * Calcula el progreso de un ejercicio individual usando múltiples períodos para mayor robustez
 * @param exerciseRecords Array de registros de un ejercicio específico
 * @returns Objeto con progreso absoluto y porcentual
 */
export const calculateExerciseProgress = (exerciseRecords: WorkoutRecord[]): {
  absoluteProgress: number;
  percentProgress: number;
  first1RM: number;
  last1RM: number;
} => {
  if (exerciseRecords.length < 2) {
    return { absoluteProgress: 0, percentProgress: 0, first1RM: 0, last1RM: 0 };
  }

  const sortedRecords = [...exerciseRecords].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // **CORRECCIÓN CLAVE**: Agrupar por sesiones/fechas antes de calcular progreso
  const sessionGroups = new Map<string, WorkoutRecord[]>();

  sortedRecords.forEach(record => {
    const dateKey = new Date(record.date).toDateString();
    if (!sessionGroups.has(dateKey)) {
      sessionGroups.set(dateKey, []);
    }
    sessionGroups.get(dateKey)!.push(record);
  });

  // Calcular 1RM promedio por sesión
  const sessionAverages = Array.from(sessionGroups.entries())
    .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
    .map(([date, sessionRecords]) => {
      const session1RMs = sessionRecords.map(r => r.weight * (1 + Math.min(r.reps, 20) / 30));
      const avgSession1RM = session1RMs.reduce((sum, rm) => sum + rm, 0) / session1RMs.length;
      return { date, avg1RM: avgSession1RM };
    });

  // Para ejercicios individuales, usar múltiples sesiones para mayor estabilidad
  let first1RM: number;
  let last1RM: number;

  if (sessionAverages.length === 1) {
    // Solo una sesión, no hay progreso
    return { absoluteProgress: 0, percentProgress: 0, first1RM: sessionAverages[0].avg1RM, last1RM: sessionAverages[0].avg1RM };
  } else if (sessionAverages.length === 2) {
    // Para 2 sesiones, usar directamente primera y última
    first1RM = sessionAverages[0].avg1RM;
    last1RM = sessionAverages[1].avg1RM;
  } else {
    // Para 3+ sesiones, usar lógica de períodos basada en sesiones
    const firstPeriodSize = Math.min(2, Math.floor(sessionAverages.length / 3));
    const lastPeriodSize = Math.min(2, Math.floor(sessionAverages.length / 3));

    // Asegurar que los períodos tengan al menos 1 elemento
    const actualFirstPeriodSize = Math.max(1, firstPeriodSize);
    const actualLastPeriodSize = Math.max(1, lastPeriodSize);

    const firstPeriod = sessionAverages.slice(0, actualFirstPeriodSize);
    const lastPeriod = sessionAverages.slice(-actualLastPeriodSize);

    first1RM = firstPeriod.reduce((sum, session) => sum + session.avg1RM, 0) / firstPeriod.length;
    last1RM = lastPeriod.reduce((sum, session) => sum + session.avg1RM, 0) / lastPeriod.length;
  }

  const absoluteProgress = last1RM - first1RM;

  // Calcular porcentaje con validación
  if (first1RM <= 0) {
    return { absoluteProgress, percentProgress: 0, first1RM, last1RM };
  }

  const rawPercentProgress = (absoluteProgress / first1RM) * 100;

  // Limitar progreso a un rango razonable (-80% a +300% para ejercicios individuales)
  const percentProgress = Math.max(-80, Math.min(300, rawPercentProgress));

  return { absoluteProgress, percentProgress, first1RM, last1RM };
};

/**
 * Calcula el progreso de peso general usando múltiples períodos para mayor robustez
 * @param records Array de todos los registros
 * @returns Objeto con progreso absoluto y porcentual de peso
 */
export const calculateWeightProgress = (records: WorkoutRecord[]): {
  absoluteProgress: number;
  percentProgress: number;
  firstAvg1RM: number;
  lastAvg1RM: number;
} => {
  if (records.length < 10) { // Necesita más datos para análisis general
    return { absoluteProgress: 0, percentProgress: 0, firstAvg1RM: 0, lastAvg1RM: 0 };
  }

  const sortedRecords = [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Para progreso general, usar períodos más grandes
  const firstPeriodSize = Math.min(10, Math.floor(sortedRecords.length / 4));
  const lastPeriodSize = Math.min(10, Math.floor(sortedRecords.length / 4));

  const firstPeriod = sortedRecords.slice(0, firstPeriodSize);
  const lastPeriod = sortedRecords.slice(-lastPeriodSize);

  // Calcular 1RM promedio para cada período
  const firstAvg1RM = firstPeriod.reduce((sum, r) => {
    const oneRM = r.weight * (1 + Math.min(r.reps, 20) / 30);
    return sum + oneRM;
  }, 0) / firstPeriod.length;

  const lastAvg1RM = lastPeriod.reduce((sum, r) => {
    const oneRM = r.weight * (1 + Math.min(r.reps, 20) / 30);
    return sum + oneRM;
  }, 0) / lastPeriod.length;

  const absoluteProgress = lastAvg1RM - firstAvg1RM;

  // Calcular porcentaje con validación
  if (firstAvg1RM <= 0) {
    return { absoluteProgress, percentProgress: 0, firstAvg1RM, lastAvg1RM };
  }

  const rawPercentProgress = (absoluteProgress / firstAvg1RM) * 100;

  // Limitar progreso a un rango razonable (-70% a +150% para progreso general)
  const percentProgress = Math.max(-70, Math.min(150, rawPercentProgress));

  return { absoluteProgress, percentProgress, firstAvg1RM, lastAvg1RM };
};

/**
 * Calcula cambio semanal entre dos períodos usando volumen promedio por sesión
 * @param currentPeriod Array de registros del período actual
 * @param previousPeriod Array de registros del período anterior
 * @returns Objeto con cambio absoluto y porcentual
 */
export const calculateWeeklyChange = (currentPeriod: WorkoutRecord[], previousPeriod: WorkoutRecord[]): {
  absoluteChange: number;
  percentChange: number;
  trend: 'up' | 'down' | 'stable';
} => {
  if (currentPeriod.length === 0 || previousPeriod.length === 0) {
    return { absoluteChange: 0, percentChange: 0, trend: 'stable' };
  }

  // Calcular volumen promedio por sesión para cada período
  const currentVolume = currentPeriod.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0);
  const previousVolume = previousPeriod.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0);

  const currentAvg = currentVolume / currentPeriod.length;
  const previousAvg = previousVolume / previousPeriod.length;

  const absoluteChange = currentAvg - previousAvg;

  if (previousAvg <= 0) {
    return { absoluteChange, percentChange: 0, trend: 'stable' };
  }

  const percentChange = (absoluteChange / previousAvg) * 100;

  let trend: 'up' | 'down' | 'stable';
  if (Math.abs(percentChange) < 5) {
    trend = 'stable';
  } else if (percentChange > 0) {
    trend = 'up';
  } else {
    trend = 'down';
  }

  return { absoluteChange: Math.round(absoluteChange), percentChange, trend };
}; 