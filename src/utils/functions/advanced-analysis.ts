import { differenceInDays, endOfWeek, startOfWeek, subDays, subWeeks } from 'date-fns';
import type { WorkoutRecord } from '../../interfaces';

/**
 * Interfaz para densidad de entrenamiento
 */
export interface TrainingDensity {
  period: string;
  workoutsPerWeek: number;
  volumePerWorkout: number;
  densityScore: number; // Volumen por minuto estimado
  intensityLevel: 'Baja' | 'Media' | 'Alta' | 'Muy Alta';
}

/**
 * Interfaz para eficiencia de entrenamiento
 */
export interface TrainingEfficiency {
  volumeToWeightRatio: number;
  setsToVolumeRatio: number;
  timeEfficiencyScore: number;
  optimalLoadRange: { min: number; max: number };
  recommendedAdjustments: string[];
}

/**
 * Interfaz para análisis de fatiga
 */
export interface FatigueAnalysis {
  fatigueIndex: number; // 0-100, donde 100 es fatiga máxima
  recoveryDays: number;
  volumeDropIndicators: boolean;
  overreachingRisk: 'Bajo' | 'Medio' | 'Alto';
  restRecommendation: string;
}

/**
 * Interfaz para comparación de períodos
 */
export interface PeriodComparison {
  periodName: string;
  workouts: number;
  totalVolume: number;
  avgWeight: number;
  improvement: number; // Porcentaje vs período anterior
  volumeChange: number;
  strengthChange: number;
}

/**
 * Interfaz para predicciones
 */
export interface ProgressPrediction {
  nextWeekVolume: number;
  nextWeekWeight: number;
  monthlyGrowthRate: number;
  predictedPR: { weight: number; confidence: number };
  plateauRisk: number; // 0-100
}

/**
 * Interfaz para métricas de intensidad
 */
export interface IntensityMetrics {
  averageIntensity: number; // Peso promedio como % del máximo
  volumeIntensity: number; // Volumen total vs capacidad estimada
  frequencyIntensity: number; // Frecuencia vs recomendada
  overallIntensity: 'Baja' | 'Óptima' | 'Alta' | 'Excesiva';
  recommendations: string[];
}

/**
 * Interfaz para análisis avanzado completo
 */
export interface AdvancedAnalysis {
  trainingDensity: TrainingDensity[];
  trainingEfficiency: TrainingEfficiency;
  fatigueAnalysis: FatigueAnalysis;
  periodComparisons: PeriodComparison[];
  progressPrediction: ProgressPrediction;
  intensityMetrics: IntensityMetrics;
  peakPerformanceIndicators: string[];
  optimizationSuggestions: string[];
}

/**
 * Calcula densidad de entrenamiento por período
 */
export const calculateTrainingDensity = (records: WorkoutRecord[]): TrainingDensity[] => {
  if (records.length === 0) return [];

  const periods = [
    { name: 'Esta semana', weeks: 1 },
    { name: 'Últimas 2 semanas', weeks: 2 },
    { name: 'Último mes', weeks: 4 },
    { name: 'Últimos 2 meses', weeks: 8 }
  ];

  const densityData: TrainingDensity[] = [];

  periods.forEach(period => {
    const cutoffDate = subDays(new Date(), period.weeks * 7);
    const periodRecords = records.filter(r => new Date(r.date) >= cutoffDate);

    if (periodRecords.length > 0) {
      const totalVolume = periodRecords.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0);
      const avgVolumePerWorkout = totalVolume / periodRecords.length;
      const workoutsPerWeek = periodRecords.length / period.weeks;

      // Calcular densidad (volumen por unidad de tiempo estimada)
      const estimatedMinutesPerWorkout = 60; // Asumimos 60 min promedio
      const densityScore = avgVolumePerWorkout / estimatedMinutesPerWorkout;

      // Determinar nivel de intensidad
      let intensityLevel: TrainingDensity['intensityLevel'];
      if (workoutsPerWeek >= 6) intensityLevel = 'Muy Alta';
      else if (workoutsPerWeek >= 4) intensityLevel = 'Alta';
      else if (workoutsPerWeek >= 2) intensityLevel = 'Media';
      else intensityLevel = 'Baja';

      densityData.push({
        period: period.name,
        workoutsPerWeek: Math.round(workoutsPerWeek * 10) / 10,
        volumePerWorkout: Math.round(avgVolumePerWorkout),
        densityScore: Math.round(densityScore),
        intensityLevel
      });
    }
  });

  return densityData;
};

/**
 * Analiza eficiencia de entrenamiento
 */
export const analyzeTrainingEfficiency = (records: WorkoutRecord[]): TrainingEfficiency => {
  if (records.length === 0) {
    return {
      volumeToWeightRatio: 0,
      setsToVolumeRatio: 0,
      timeEfficiencyScore: 0,
      optimalLoadRange: { min: 0, max: 0 },
      recommendedAdjustments: ['Sin datos suficientes para análisis']
    };
  }

  // Ratio volumen/peso promedio
  const totalVolume = records.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0);
  const avgWeight = records.reduce((sum, r) => sum + r.weight, 0) / records.length;
  const volumeToWeightRatio = totalVolume / avgWeight;

  // Ratio series/volumen (eficiencia por serie)
  const totalSets = records.reduce((sum, r) => sum + r.sets, 0);
  const setsToVolumeRatio = totalVolume / totalSets;

  // Score de eficiencia temporal (basado en volumen por sesión)
  const avgVolumePerSession = totalVolume / records.length;
  const timeEfficiencyScore = Math.min(100, (avgVolumePerSession / 1000) * 100);

  // Rango óptimo de carga (basado en datos históricos)
  const weights = records.map(r => r.weight).sort((a, b) => a - b);
  const optimalLoadRange = {
    min: Math.round(weights[Math.floor(weights.length * 0.2)]),
    max: Math.round(weights[Math.floor(weights.length * 0.8)])
  };

  // Recomendaciones basadas en análisis
  const recommendations: string[] = [];

  if (timeEfficiencyScore < 50) {
    recommendations.push('Aumentar intensidad o volumen por sesión');
  }
  if (setsToVolumeRatio < 50) {
    recommendations.push('Optimizar carga por serie para mayor eficiencia');
  }
  if (volumeToWeightRatio > 100) {
    recommendations.push('Considerar aumentar pesos para mayor intensidad');
  }
  if (recommendations.length === 0) {
    recommendations.push('Eficiencia óptima, mantener rutina actual');
  }

  return {
    volumeToWeightRatio: Math.round(volumeToWeightRatio),
    setsToVolumeRatio: Math.round(setsToVolumeRatio),
    timeEfficiencyScore: Math.round(timeEfficiencyScore),
    optimalLoadRange,
    recommendedAdjustments: recommendations
  };
};

/**
 * Analiza fatiga y recuperación
 */
export const analyzeFatigue = (records: WorkoutRecord[]): FatigueAnalysis => {
  if (records.length < 7) {
    return {
      fatigueIndex: 0,
      recoveryDays: 0,
      volumeDropIndicators: false,
      overreachingRisk: 'Bajo',
      restRecommendation: 'Datos insuficientes para análisis'
    };
  }

  // Calcular tendencia de volumen (últimas 2 semanas vs anteriores)
  const recentRecords = records.slice(-14);
  const olderRecords = records.slice(-28, -14);

  const recentVolume = recentRecords.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0);
  const olderVolume = olderRecords.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0);

  const volumeChange = olderVolume > 0 ? ((recentVolume - olderVolume) / olderVolume) * 100 : 0;
  const volumeDropIndicators = volumeChange < -15; // Caída > 15%

  // Calcular días desde último entrenamiento
  const lastWorkout = new Date(Math.max(...records.map(r => new Date(r.date).getTime())));
  const recoveryDays = differenceInDays(new Date(), lastWorkout);

  // Índice de fatiga basado en frecuencia y volumen
  const weeklyFrequency = records.slice(-7).length;
  const frequencyFactor = weeklyFrequency > 5 ? 30 : weeklyFrequency > 3 ? 15 : 0;
  const volumeFactor = volumeDropIndicators ? 25 : 0;
  const recoveryFactor = recoveryDays === 0 ? 20 : recoveryDays > 3 ? -10 : 0;

  const fatigueIndex = Math.min(100, Math.max(0, frequencyFactor + volumeFactor + recoveryFactor));

  // Riesgo de sobreentrenamiento
  let overreachingRisk: FatigueAnalysis['overreachingRisk'];
  if (fatigueIndex > 70) overreachingRisk = 'Alto';
  else if (fatigueIndex > 40) overreachingRisk = 'Medio';
  else overreachingRisk = 'Bajo';

  // Recomendación de descanso
  let restRecommendation: string;
  if (fatigueIndex > 70) restRecommendation = 'Descanso activo 2-3 días';
  else if (fatigueIndex > 40) restRecommendation = 'Reducir intensidad próxima sesión';
  else if (recoveryDays > 4) restRecommendation = 'Retomar entrenamientos gradualmente';
  else restRecommendation = 'Continuar rutina normal';

  return {
    fatigueIndex,
    recoveryDays,
    volumeDropIndicators,
    overreachingRisk,
    restRecommendation
  };
};

/**
 * Compara diferentes períodos de tiempo
 */
export const comparePeriods = (records: WorkoutRecord[]): PeriodComparison[] => {
  if (records.length === 0) return [];

  const periods = [
    { name: 'Esta semana', days: 7 },
    { name: 'Últimas 2 semanas', days: 14 },
    { name: 'Último mes', days: 30 },
    { name: 'Últimos 3 meses', days: 90 }
  ];

  const comparisons: PeriodComparison[] = [];

  periods.forEach((period) => {
    const endDate = new Date();
    const startDate = subDays(endDate, period.days);
    const periodRecords = records.filter(r => {
      const recordDate = new Date(r.date);
      return recordDate >= startDate && recordDate <= endDate;
    });

    if (periodRecords.length > 0) {
      const totalVolume = periodRecords.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0);
      const avgWeight = periodRecords.reduce((sum, r) => sum + r.weight, 0) / periodRecords.length;

      // Calcular promedio de 1RM estimado para mejor comparación de fuerza
      const avg1RM = periodRecords.reduce((sum, r) => {
        const oneRM = r.weight * (1 + Math.min(r.reps, 20) / 30);
        return sum + oneRM;
      }, 0) / periodRecords.length;

      // Comparar con período anterior del mismo tamaño
      const prevStartDate = subDays(startDate, period.days);
      const prevRecords = records.filter(r => {
        const recordDate = new Date(r.date);
        return recordDate >= prevStartDate && recordDate < startDate;
      });

      let improvement = 0;
      let volumeChange = 0;
      let strengthChange = 0;

      if (prevRecords.length > 0) {
        const prevVolume = prevRecords.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0);
        const prevAvg1RM = prevRecords.reduce((sum, r) => {
          const oneRM = r.weight * (1 + Math.min(r.reps, 20) / 30);
          return sum + oneRM;
        }, 0) / prevRecords.length;

        volumeChange = prevVolume > 0 ? ((totalVolume - prevVolume) / prevVolume) * 100 : 0;
        strengthChange = prevAvg1RM > 0 ? ((avg1RM - prevAvg1RM) / prevAvg1RM) * 100 : 0;
        improvement = (volumeChange + strengthChange) / 2;
      }

      comparisons.push({
        periodName: period.name,
        workouts: periodRecords.length,
        totalVolume: Math.round(totalVolume),
        avgWeight: Math.round(avgWeight * 100) / 100,
        improvement: Math.round(improvement),
        volumeChange: Math.round(volumeChange),
        strengthChange: Math.round(strengthChange)
      });
    }
  });

  return comparisons;
};

/**
 * Predice progreso futuro
 */
export const predictProgress = (records: WorkoutRecord[]): ProgressPrediction => {
  if (records.length < 10) {
    return {
      nextWeekVolume: 0,
      nextWeekWeight: 0,
      monthlyGrowthRate: 0,
      predictedPR: { weight: 0, confidence: 0 },
      plateauRisk: 0
    };
  }

  // Análisis de tendencia basado en últimas 8 semanas
  const recentWeeks = 8;
  const weeklyData: { volume: number; weight: number }[] = [];

  for (let i = 0; i < recentWeeks; i++) {
    const weekStart = startOfWeek(subWeeks(new Date(), i));
    const weekEnd = endOfWeek(weekStart);
    const weekRecords = records.filter(r => {
      const recordDate = new Date(r.date);
      return recordDate >= weekStart && recordDate <= weekEnd;
    });

    if (weekRecords.length > 0) {
      const volume = weekRecords.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0);
      // Usar 1RM promedio estimado en lugar de peso promedio para mejor predicción
      const avg1RM = weekRecords.reduce((sum, r) => {
        const oneRM = r.weight * (1 + Math.min(r.reps, 20) / 30);
        return sum + oneRM;
      }, 0) / weekRecords.length;
      weeklyData.push({ volume, weight: avg1RM });
    }
  }

  if (weeklyData.length < 3) {
    return {
      nextWeekVolume: 0,
      nextWeekWeight: 0,
      monthlyGrowthRate: 0,
      predictedPR: { weight: 0, confidence: 0 },
      plateauRisk: 50
    };
  }

  // Calcular tendencias lineales simples
  const volumeTrend = weeklyData.length > 1 ?
    (weeklyData[0].volume - weeklyData[weeklyData.length - 1].volume) / weeklyData.length : 0;
  const weightTrend = weeklyData.length > 1 ?
    (weeklyData[0].weight - weeklyData[weeklyData.length - 1].weight) / weeklyData.length : 0;

  // Predicciones para próxima semana
  const nextWeekVolume = weeklyData[0].volume + volumeTrend;
  const nextWeekWeight = weeklyData[0].weight + weightTrend;

  // Tasa de crecimiento mensual
  const monthlyGrowthRate = weightTrend * 4; // 4 semanas por mes

  // Predicción de PR usando 1RM estimado máximo
  const current1RMMax = Math.max(...records.map(r => r.weight * (1 + Math.min(r.reps, 20) / 30)));
  const predictedPRWeight = current1RMMax + (weightTrend * 2); // 2 semanas de progreso
  const confidence = Math.min(95, Math.max(10, 70 - Math.abs(weeklyData.length - 6) * 10));

  // Riesgo de meseta
  const weightVariation = weeklyData.map(w => w.weight);
  const variance = weightVariation.reduce((sum, w) => sum + Math.pow(w - weeklyData[0].weight, 2), 0) / weightVariation.length;
  const plateauRisk = variance < 1 ? 80 : variance < 5 ? 40 : 20;

  return {
    nextWeekVolume: Math.round(nextWeekVolume),
    nextWeekWeight: Math.round(nextWeekWeight * 100) / 100,
    monthlyGrowthRate: Math.round(monthlyGrowthRate * 100) / 100,
    predictedPR: {
      weight: Math.round(predictedPRWeight * 100) / 100,
      confidence: Math.round(confidence)
    },
    plateauRisk: Math.round(plateauRisk)
  };
};

/**
 * Analiza métricas de intensidad
 */
export const analyzeIntensityMetrics = (records: WorkoutRecord[]): IntensityMetrics => {
  if (records.length === 0) {
    return {
      averageIntensity: 0,
      volumeIntensity: 0,
      frequencyIntensity: 0,
      overallIntensity: 'Baja',
      recommendations: ['Sin datos para análisis']
    };
  }

  const maxWeight = Math.max(...records.map(r => r.weight));
  const avgWeight = records.reduce((sum, r) => sum + r.weight, 0) / records.length;
  const averageIntensity = maxWeight > 0 ? (avgWeight / maxWeight) * 100 : 0;

  // Estimación de capacidad de volumen basada en peso máximo
  const estimatedMaxVolume = maxWeight * 10 * 5; // Estimación: peso_max × 10_reps × 5_series
  const actualVolume = records.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0) / records.length;
  const volumeIntensity = (actualVolume / estimatedMaxVolume) * 100;

  // Frecuencia vs recomendada (3-4 sesiones por semana)
  const weeklyFrequency = records.slice(-7).length;
  const frequencyIntensity = (weeklyFrequency / 4) * 100;

  // Intensidad general
  const overallScore = (averageIntensity + volumeIntensity + frequencyIntensity) / 3;
  let overallIntensity: IntensityMetrics['overallIntensity'];
  if (overallScore > 90) overallIntensity = 'Excesiva';
  else if (overallScore > 70) overallIntensity = 'Alta';
  else if (overallScore > 40) overallIntensity = 'Óptima';
  else overallIntensity = 'Baja';

  // Recomendaciones
  const recommendations: string[] = [];
  if (averageIntensity < 60) recommendations.push('Incrementar pesos gradualmente');
  if (volumeIntensity < 50) recommendations.push('Aumentar volumen por sesión');
  if (frequencyIntensity < 75) recommendations.push('Incrementar frecuencia de entrenamiento');
  if (overallScore > 90) recommendations.push('Considerar semana de descarga');
  if (recommendations.length === 0) recommendations.push('Mantener intensidad actual');

  return {
    averageIntensity: Math.round(averageIntensity),
    volumeIntensity: Math.round(volumeIntensity),
    frequencyIntensity: Math.round(frequencyIntensity),
    overallIntensity,
    recommendations
  };
};

/**
 * Calcula análisis avanzado completo
 */
export const calculateAdvancedAnalysis = (records: WorkoutRecord[]): AdvancedAnalysis => {
  const trainingDensity = calculateTrainingDensity(records);
  const fatigueAnalysis = analyzeFatigue(records);
  const intensityMetrics = analyzeIntensityMetrics(records);

  // Indicadores de rendimiento pico
  const peakPerformanceIndicators: string[] = [];
  if (intensityMetrics.overallIntensity === 'Óptima') {
    peakPerformanceIndicators.push('Intensidad en rango óptimo');
  }
  if (fatigueAnalysis.overreachingRisk === 'Bajo') {
    peakPerformanceIndicators.push('Bajo riesgo de sobreentrenamiento');
  }
  if (trainingDensity[0]?.intensityLevel === 'Alta') {
    peakPerformanceIndicators.push('Alta densidad de entrenamiento');
  }

  // Sugerencias de optimización
  const optimizationSuggestions: string[] = [];
  const efficiency = analyzeTrainingEfficiency(records);
  optimizationSuggestions.push(...efficiency.recommendedAdjustments);
  optimizationSuggestions.push(...intensityMetrics.recommendations);
  if (fatigueAnalysis.restRecommendation !== 'Continuar rutina normal') {
    optimizationSuggestions.push(fatigueAnalysis.restRecommendation);
  }

  return {
    trainingDensity,
    trainingEfficiency: efficiency,
    fatigueAnalysis,
    periodComparisons: comparePeriods(records),
    progressPrediction: predictProgress(records),
    intensityMetrics,
    peakPerformanceIndicators,
    optimizationSuggestions: [...new Set(optimizationSuggestions)] // Eliminar duplicados
  };
};