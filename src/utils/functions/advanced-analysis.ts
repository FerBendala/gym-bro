import { differenceInDays, endOfWeek, startOfWeek, subWeeks } from 'date-fns';
import { es } from 'date-fns/locale';
import type { WorkoutRecord } from '../../interfaces';
import { calculateIntensityScore } from './category-analysis';

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
 * Interfaz para análisis de fatiga y recuperación
 */
export interface FatigueAnalysis {
  fatigueIndex: number; // 0-100, donde 100 es fatiga máxima
  recoveryDays: number;
  volumeDropIndicators: boolean;
  overreachingRisk: 'Bajo' | 'Medio' | 'Alto';
  restRecommendation: string;
  // Nuevas métricas
  fatigueLevel: 'Muy Baja' | 'Baja' | 'Moderada' | 'Alta' | 'Muy Alta';
  recoveryRate: number; // 0-100, qué tan bien te recuperas
  workloadTrend: 'Aumentando' | 'Estable' | 'Disminuyendo';
  recoveryScore: number; // 0-100, score general de recuperación
  stressFactors: {
    volumeStress: number;
    frequencyStress: number;
    intensityStress: number;
    recoveryStress: number;
  };
  recoveryRecommendations: string[];
  predictedRecoveryTime: number; // Horas estimadas para recuperación completa
  fatigueHistory: {
    trend: 'Mejorando' | 'Estable' | 'Empeorando';
    consistency: number; // 0-100, qué tan consistente es tu recuperación
  };
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
 * Obtiene registros de la semana actual (lunes a domingo)
 */
export const getThisWeekRecords = (records: WorkoutRecord[]): WorkoutRecord[] => {
  const now = new Date();
  const weekStart = startOfWeek(now, { locale: es }); // Lunes
  const weekEnd = endOfWeek(now, { locale: es }); // Domingo

  return records.filter(record => {
    const recordDate = new Date(record.date);
    return recordDate >= weekStart && recordDate <= weekEnd;
  });
};

/**
 * Obtiene registros de la semana pasada (lunes a domingo)
 */
export const getLastWeekRecords = (records: WorkoutRecord[]): WorkoutRecord[] => {
  const now = new Date();
  const lastWeekStart = startOfWeek(subWeeks(now, 1), { locale: es }); // Lunes semana pasada
  const lastWeekEnd = endOfWeek(lastWeekStart, { locale: es }); // Domingo semana pasada

  return records.filter(record => {
    const recordDate = new Date(record.date);
    return recordDate >= lastWeekStart && recordDate <= lastWeekEnd;
  });
};

/**
 * Calcula densidad de entrenamiento por período
 */
export const calculateTrainingDensity = (records: WorkoutRecord[]): TrainingDensity[] => {
  if (records.length === 0) return [];

  const now = new Date();
  const periods = [
    {
      name: 'Esta semana',
      getRecords: () => getThisWeekRecords(records),
      weeks: 1
    },
    {
      name: 'Últimas 2 semanas',
      getRecords: () => {
        const twoWeeksStart = startOfWeek(subWeeks(now, 1), { locale: es });
        const twoWeeksEnd = endOfWeek(now, { locale: es });
        return records.filter(r => {
          const recordDate = new Date(r.date);
          return recordDate >= twoWeeksStart && recordDate <= twoWeeksEnd;
        });
      },
      weeks: 2
    },
    {
      name: 'Último mes',
      getRecords: () => {
        const monthStart = startOfWeek(subWeeks(now, 3), { locale: es });
        const monthEnd = endOfWeek(now, { locale: es });
        return records.filter(r => {
          const recordDate = new Date(r.date);
          return recordDate >= monthStart && recordDate <= monthEnd;
        });
      },
      weeks: 4
    },
    {
      name: 'Últimos 2 meses',
      getRecords: () => {
        const twoMonthsStart = startOfWeek(subWeeks(now, 7), { locale: es });
        const twoMonthsEnd = endOfWeek(now, { locale: es });
        return records.filter(r => {
          const recordDate = new Date(r.date);
          return recordDate >= twoMonthsStart && recordDate <= twoMonthsEnd;
        });
      },
      weeks: 8
    }
  ];

  const densityData: TrainingDensity[] = [];

  periods.forEach(period => {
    const periodRecords = period.getRecords();

    if (periodRecords.length > 0) {
      const totalVolume = periodRecords.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0);
      const avgVolumePerWorkout = totalVolume / periodRecords.length;
      // Calcular días únicos por semana en lugar de ejercicios individuales
      const uniqueDays = new Set(periodRecords.map(r => r.date.toDateString())).size;
      const workoutsPerWeek = uniqueDays / period.weeks;

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
      restRecommendation: 'Datos insuficientes para análisis',
      fatigueLevel: 'Muy Baja',
      recoveryRate: 0,
      workloadTrend: 'Estable',
      recoveryScore: 0,
      stressFactors: {
        volumeStress: 0,
        frequencyStress: 0,
        intensityStress: 0,
        recoveryStress: 0
      },
      recoveryRecommendations: [],
      predictedRecoveryTime: 0,
      fatigueHistory: {
        trend: 'Estable',
        consistency: 0
      }
    };
  }

  // Calcular tendencia de volumen (últimas 2 semanas vs anteriores)
  const now = new Date();
  const recent2WeeksStart = startOfWeek(subWeeks(now, 1), { locale: es });
  const recent2WeeksEnd = endOfWeek(now, { locale: es });
  const recentRecords = records.filter(r => {
    const recordDate = new Date(r.date);
    return recordDate >= recent2WeeksStart && recordDate <= recent2WeeksEnd;
  });

  const older2WeeksStart = startOfWeek(subWeeks(now, 3), { locale: es });
  const older2WeeksEnd = endOfWeek(subWeeks(now, 2), { locale: es });
  const olderRecords = records.filter(r => {
    const recordDate = new Date(r.date);
    return recordDate >= older2WeeksStart && recordDate <= older2WeeksEnd;
  });

  const recentVolume = recentRecords.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0);
  const olderVolume = olderRecords.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0);

  const volumeChange = olderVolume > 0 ? ((recentVolume - olderVolume) / olderVolume) * 100 : 0;
  const volumeDropIndicators = volumeChange < -15; // Caída > 15%

  // Calcular días desde último entrenamiento
  const lastWorkout = new Date(Math.max(...records.map(r => new Date(r.date).getTime())));
  const recoveryDays = differenceInDays(new Date(), lastWorkout);

  // Índice de fatiga basado en frecuencia y volumen
  const thisWeekRecords = getThisWeekRecords(records);
  // Calcular días únicos en lugar de registros individuales
  const weeklyFrequency = new Set(thisWeekRecords.map(r => r.date.toDateString())).size;
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

  // Nuevas métricas
  let fatigueLevel: FatigueAnalysis['fatigueLevel'];
  if (fatigueIndex < 20) fatigueLevel = 'Muy Baja';
  else if (fatigueIndex < 40) fatigueLevel = 'Baja';
  else if (fatigueIndex < 60) fatigueLevel = 'Moderada';
  else if (fatigueIndex < 80) fatigueLevel = 'Alta';
  else fatigueLevel = 'Muy Alta';

  const recoveryRate = Math.min(100, Math.max(0, 100 - (fatigueIndex * 0.8)));

  // Calcular workload trend
  let workloadTrend: FatigueAnalysis['workloadTrend'];
  if (volumeChange > 10) workloadTrend = 'Aumentando';
  else if (volumeChange < -10) workloadTrend = 'Disminuyendo';
  else workloadTrend = 'Estable';

  // Calcular recovery score basado en múltiples factores
  const recoveryScore = Math.min(100, Math.max(0,
    100 - (fatigueIndex * 0.6) - (recoveryDays > 2 ? (recoveryDays - 2) * 5 : 0)
  ));

  // Calcular stress factors más realistas
  const stressFactors: FatigueAnalysis['stressFactors'] = {
    volumeStress: Math.min(100, Math.max(0, volumeChange > 0 ? volumeChange * 2 : 0)),
    frequencyStress: Math.min(100, Math.max(0, weeklyFrequency > 5 ? (weeklyFrequency - 5) * 20 : 0)),
    intensityStress: Math.min(100, Math.max(0, fatigueIndex > 50 ? (fatigueIndex - 50) * 2 : 0)),
    recoveryStress: Math.min(100, Math.max(0, recoveryDays === 0 ? 80 : recoveryDays > 3 ? 0 : (3 - recoveryDays) * 20))
  };

  // Recomendaciones de recuperación mejoradas
  const recoveryRecommendations: string[] = [];

  if (fatigueIndex > 70) {
    recoveryRecommendations.push('Descanso completo 2-3 días');
    recoveryRecommendations.push('Enfócate en hidratación y nutrición');
  } else if (fatigueIndex > 50) {
    recoveryRecommendations.push('Reducir intensidad 20-30% próxima sesión');
    recoveryRecommendations.push('Añadir 10-15 min de estiramiento post-entrenamiento');
  } else if (fatigueIndex > 30) {
    recoveryRecommendations.push('Mantener intensidad pero observar signos de fatiga');
    recoveryRecommendations.push('Priorizar sueño de calidad (7-9 horas)');
  } else {
    recoveryRecommendations.push('Recuperación óptima - puedes mantener o incrementar carga');
  }

  if (recoveryDays > 5) {
    recoveryRecommendations.push('Retomar gradualmente con 60-70% de intensidad habitual');
  } else if (recoveryDays === 0) {
    recoveryRecommendations.push('Considera al menos 1 día de descanso por semana');
  }

  if (volumeDropIndicators) {
    recoveryRecommendations.push('Caída de volumen detectada - evaluar factores externos');
  }

  // Tiempo estimado de recuperación más realista
  const predictedRecoveryTime = Math.max(8, Math.min(72,
    (fatigueIndex / 100) * 48 + (recoveryDays === 0 ? 12 : 0)
  ));

  // Análisis de historial de fatiga
  const fatigueHistory: FatigueAnalysis['fatigueHistory'] = {
    trend: volumeChange > 15 ? 'Empeorando' : volumeChange < -15 ? 'Mejorando' : 'Estable',
    consistency: Math.min(100, Math.max(0, 100 - Math.abs(volumeChange)))
  };

  return {
    fatigueIndex,
    recoveryDays,
    volumeDropIndicators,
    overreachingRisk,
    restRecommendation,
    fatigueLevel,
    recoveryRate,
    workloadTrend,
    recoveryScore,
    stressFactors,
    recoveryRecommendations,
    predictedRecoveryTime,
    fatigueHistory
  };
};

/**
 * Compara diferentes períodos de tiempo
 */
export const comparePeriods = (records: WorkoutRecord[]): PeriodComparison[] => {
  if (records.length === 0) return [];

  const now = new Date();
  const periods = [
    {
      name: 'Esta semana',
      getRecords: () => getThisWeekRecords(records),
      getPrevRecords: () => getLastWeekRecords(records)
    },
    {
      name: 'Últimas 2 semanas',
      getRecords: () => {
        const twoWeeksStart = startOfWeek(subWeeks(now, 1), { locale: es });
        const twoWeeksEnd = endOfWeek(now, { locale: es });
        return records.filter(r => {
          const recordDate = new Date(r.date);
          return recordDate >= twoWeeksStart && recordDate <= twoWeeksEnd;
        });
      },
      getPrevRecords: () => {
        const prevTwoWeeksStart = startOfWeek(subWeeks(now, 3), { locale: es });
        const prevTwoWeeksEnd = endOfWeek(subWeeks(now, 2), { locale: es });
        return records.filter(r => {
          const recordDate = new Date(r.date);
          return recordDate >= prevTwoWeeksStart && recordDate <= prevTwoWeeksEnd;
        });
      }
    },
    {
      name: 'Último mes',
      getRecords: () => {
        const monthStart = startOfWeek(subWeeks(now, 3), { locale: es });
        const monthEnd = endOfWeek(now, { locale: es });
        return records.filter(r => {
          const recordDate = new Date(r.date);
          return recordDate >= monthStart && recordDate <= monthEnd;
        });
      },
      getPrevRecords: () => {
        const prevMonthStart = startOfWeek(subWeeks(now, 7), { locale: es });
        const prevMonthEnd = endOfWeek(subWeeks(now, 4), { locale: es });
        return records.filter(r => {
          const recordDate = new Date(r.date);
          return recordDate >= prevMonthStart && recordDate <= prevMonthEnd;
        });
      }
    },
    {
      name: 'Últimos 3 meses',
      getRecords: () => {
        const threeMonthsStart = startOfWeek(subWeeks(now, 11), { locale: es });
        const threeMonthsEnd = endOfWeek(now, { locale: es });
        return records.filter(r => {
          const recordDate = new Date(r.date);
          return recordDate >= threeMonthsStart && recordDate <= threeMonthsEnd;
        });
      },
      getPrevRecords: () => {
        const prevThreeMonthsStart = startOfWeek(subWeeks(now, 23), { locale: es });
        const prevThreeMonthsEnd = endOfWeek(subWeeks(now, 12), { locale: es });
        return records.filter(r => {
          const recordDate = new Date(r.date);
          return recordDate >= prevThreeMonthsStart && recordDate <= prevThreeMonthsEnd;
        });
      }
    }
  ];

  const comparisons: PeriodComparison[] = [];

  periods.forEach((period) => {
    const periodRecords = period.getRecords();

    if (periodRecords.length > 0) {
      const totalVolume = periodRecords.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0);
      const avgWeight = periodRecords.reduce((sum, r) => sum + r.weight, 0) / periodRecords.length;

      // Calcular promedio de 1RM estimado para mejor comparación de fuerza
      const avg1RM = periodRecords.reduce((sum, r) => {
        const oneRM = r.weight * (1 + Math.min(r.reps, 20) / 30);
        return sum + oneRM;
      }, 0) / periodRecords.length;

      // Comparar con período anterior del mismo tamaño
      const prevRecords = period.getPrevRecords();

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
 * Genera predicciones básicas para usuarios nuevos (menos de 10 registros)
 */
const generateBeginnerPredictions = (records: WorkoutRecord[]): ProgressPrediction => {
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

  // Calcular métricas básicas con datos disponibles
  const sortedRecords = [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const totalVolume = records.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0);
  const avgWeight = records.reduce((sum, r) => sum + r.weight, 0) / records.length;
  const maxWeight = Math.max(...records.map(r => r.weight));
  const avgVolume = totalVolume / records.length;

  // Calcular progresión inicial si hay al menos 2 registros
  let initialProgress = 0;
  let trendAnalysis: 'mejorando' | 'estable' | 'empeorando' | 'insuficiente' = 'insuficiente';

  if (records.length >= 2) {
    const firstRecord = sortedRecords[0];
    const lastRecord = sortedRecords[sortedRecords.length - 1];
    const first1RM = firstRecord.weight * (1 + Math.min(firstRecord.reps, 20) / 30);
    const last1RM = lastRecord.weight * (1 + Math.min(lastRecord.reps, 20) / 30);

    if (first1RM > 0) {
      initialProgress = ((last1RM - first1RM) / first1RM) * 100;
    }

    // Lógica mejorada para principiantes - ser más optimista con pequeñas mejoras
    if (initialProgress > 2) trendAnalysis = 'mejorando';
    else if (initialProgress < -5) trendAnalysis = 'empeorando';
    else trendAnalysis = 'estable';
  }

  // Estimaciones optimistas para principiantes (progresión típica inicial)
  const beginnerGrowthRate = records.length >= 3 ?
    Math.max(2, Math.min(8, initialProgress * 0.5)) : 4; // 2-8% mensual típico para principiantes

  const nextWeekWeight = Math.max(maxWeight, avgWeight + (beginnerGrowthRate * 0.25)); // 25% del crecimiento mensual
  const nextWeekVolume = Math.max(avgVolume, avgVolume * 1.1); // 10% más de volumen

  // Predicción de PR conservadora para principiantes
  const current1RMMax = Math.max(...records.map(r => r.weight * (1 + Math.min(r.reps, 20) / 30)));
  const predictedPRWeight = Math.max(current1RMMax, current1RMMax * 1.05); // 5% mejora en PR

  // Tiempo estimado para próximo PR (principiantes progresan más rápido)
  const timeToNextPR = Math.max(2, Math.min(6, 8 - records.length)); // 2-6 semanas

  // Nivel de confianza basado en datos disponibles
  const confidenceLevel = Math.min(80, Math.max(30, 25 + (records.length * 5))); // 30-80% basado en número de registros

  // Riesgo de meseta bajo para principiantes
  const plateauRisk = Math.max(10, Math.min(40, 40 - (records.length * 3))); // 10-40%, menor con más datos

  // Recomendaciones específicas para principiantes
  const recommendations: string[] = [
    'Como principiante, enfócate en consistencia y técnica correcta',
    'Aumenta peso gradualmente (2.5-5kg cada 2-3 semanas)',
    'Prioriza aprender movimientos básicos antes de cargas pesadas'
  ];

  if (records.length < 5) {
    recommendations.push('Registra al menos 5 entrenamientos más para mejores predicciones');
  }

  if (trendAnalysis === 'mejorando') {
    recommendations.push('¡Excelente progresión inicial! Mantén la consistencia');
  } else if (trendAnalysis === 'estable') {
    recommendations.push('Considera aumentar peso o repeticiones gradualmente');
  } else if (trendAnalysis === 'empeorando') {
    recommendations.push('Revisa técnica y asegúrate de descansar adecuadamente');
  }

  if (records.length >= 3) {
    recommendations.push('Considera establecer rutina de 3-4 entrenamientos por semana');
  }

  // Calcular strengthTrend para determinar override
  const calculatedStrengthTrend = nextWeekWeight - avgWeight;

  // Override: Si la fuerza está claramente mejorando/empeorando, darle prioridad
  if (calculatedStrengthTrend > 2) {
    trendAnalysis = 'mejorando';
  } else if (calculatedStrengthTrend < -2) {
    trendAnalysis = 'empeorando';
  }

  return {
    nextWeekVolume: Math.round(nextWeekVolume),
    nextWeekWeight: Math.round(nextWeekWeight * 100) / 100,
    monthlyGrowthRate: Math.round(beginnerGrowthRate * 100) / 100,
    predictedPR: {
      weight: Math.round(predictedPRWeight * 100) / 100,
      confidence: Math.round(confidenceLevel * 0.8) // Reducir confianza para PR
    },
    plateauRisk: Math.round(plateauRisk),
    trendAnalysis,
    timeToNextPR,
    confidenceLevel: Math.round(confidenceLevel),
    volumeTrend: Math.round(nextWeekVolume - avgVolume),
    strengthTrend: Math.round(calculatedStrengthTrend * 100) / 100,
    recommendations
  };
};

/**
 * Genera predicciones intermedias para usuarios con 10+ registros pero menos de 4 semanas de datos
 */
const generateIntermediatePredictions = (records: WorkoutRecord[], weeklyData: { volume: number; weight: number; date: Date }[]): ProgressPrediction => {
  // Calcular métricas básicas con todos los datos disponibles
  const totalVolume = records.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0);
  const avgWeight = records.reduce((sum, r) => sum + r.weight, 0) / records.length;
  const maxWeight = Math.max(...records.map(r => r.weight));
  const avgVolume = totalVolume / records.length;

  // Calcular progresión usando todos los registros
  const sortedRecords = [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const firstRecord = sortedRecords[0];
  const lastRecord = sortedRecords[sortedRecords.length - 1];

  const first1RM = firstRecord.weight * (1 + Math.min(firstRecord.reps, 20) / 30);
  const last1RM = lastRecord.weight * (1 + Math.min(lastRecord.reps, 20) / 30);

  let overallProgress = 0;
  if (first1RM > 0) {
    overallProgress = ((last1RM - first1RM) / first1RM) * 100;
  }

  // Calcular tendencias básicas usando datos disponibles
  let trendAnalysis: 'mejorando' | 'estable' | 'empeorando' | 'insuficiente' = 'insuficiente';

  // Lógica mejorada - ser más sensible a mejoras en usuarios intermedios
  if (overallProgress > 2) trendAnalysis = 'mejorando';
  else if (overallProgress < -3) trendAnalysis = 'empeorando';
  else trendAnalysis = 'estable';

  // Usar datos semanales si están disponibles, sino usar progresión general
  let volumeTrend = 0;
  let strengthTrend = 0;

  if (weeklyData.length >= 2) {
    const recentVolume = weeklyData[0].volume;
    const previousVolume = weeklyData[1].volume;
    const recentWeight = weeklyData[0].weight;
    const previousWeight = weeklyData[1].weight;

    volumeTrend = recentVolume - previousVolume;
    strengthTrend = recentWeight - previousWeight;
  } else {
    // Estimación basada en progresión general
    const daysBetween = Math.max(1, (lastRecord.date.getTime() - firstRecord.date.getTime()) / (1000 * 60 * 60 * 24));
    const weeklyStrengthChange = overallProgress > 0 ? (overallProgress * 0.01 * avgWeight) / (daysBetween / 7) : 0;
    strengthTrend = weeklyStrengthChange;
    volumeTrend = avgVolume * 0.05; // 5% de crecimiento estimado
  }

  // Override: Si la fuerza está claramente mejorando/empeorando, darle prioridad
  if (strengthTrend > 2) {
    trendAnalysis = 'mejorando';
  } else if (strengthTrend < -2) {
    trendAnalysis = 'empeorando';
  }

  // Predicciones conservadoras
  const nextWeekWeight = Math.max(maxWeight, avgWeight + strengthTrend);
  const nextWeekVolume = Math.max(avgVolume, avgVolume + volumeTrend);
  const monthlyGrowthRate = Math.max(0, strengthTrend * 4); // 4 semanas por mes

  // Predicción de PR
  const current1RMMax = Math.max(...records.map(r => r.weight * (1 + Math.min(r.reps, 20) / 30)));
  const predictedPRWeight = Math.max(current1RMMax, current1RMMax + (strengthTrend * 2)); // 2 semanas de progreso

  // Tiempo estimado para próximo PR
  const prThreshold = current1RMMax * 1.025; // 2.5% mejora
  const timeToNextPR = strengthTrend > 0 ? Math.ceil((prThreshold - current1RMMax) / strengthTrend) : 4;

  // Nivel de confianza basado en cantidad de datos
  const confidenceLevel = Math.min(70, Math.max(40, 30 + (records.length * 2) + (weeklyData.length * 5)));

  // Riesgo de meseta moderado
  const plateauRisk = Math.max(20, Math.min(60, 50 - (overallProgress * 2)));

  // Recomendaciones específicas para usuarios intermedios
  const recommendations: string[] = [
    'Continúa registrando entrenamientos para mejorar precisión de predicciones',
    'Establece rutina consistente de 3-4 entrenamientos semanales'
  ];

  if (trendAnalysis === 'mejorando') {
    recommendations.push('Progresión positiva detectada - mantén la consistencia');
  } else if (trendAnalysis === 'estable') {
    recommendations.push('Considera aumentar gradualmente peso o volumen');
  } else if (trendAnalysis === 'empeorando') {
    recommendations.push('Revisa técnica, descanso y nutrición');
  }

  if (records.length < 20) {
    recommendations.push('Registra más entrenamientos para análisis más detallado');
  }

  return {
    nextWeekVolume: Math.round(nextWeekVolume),
    nextWeekWeight: Math.round(nextWeekWeight * 100) / 100,
    monthlyGrowthRate: Math.round(monthlyGrowthRate * 100) / 100,
    predictedPR: {
      weight: Math.round(predictedPRWeight * 100) / 100,
      confidence: Math.round(confidenceLevel * 0.7) // Reducir confianza para PR
    },
    plateauRisk: Math.round(plateauRisk),
    trendAnalysis,
    timeToNextPR: Math.max(2, Math.min(8, timeToNextPR)),
    confidenceLevel: Math.round(confidenceLevel),
    // Limitar volumeTrend a rangos razonables
    volumeTrend: Math.max(-500, Math.min(500, Math.round(volumeTrend))),
    strengthTrend: Math.round(strengthTrend * 100) / 100,
    recommendations
  };
};

/**
 * Predice progreso futuro con análisis mejorado
 */
export const predictProgress = (records: WorkoutRecord[]): ProgressPrediction => {
  // Manejo especial para usuarios nuevos (menos de 10 registros)
  if (records.length < 10) {
    return generateBeginnerPredictions(records);
  }

  const now = new Date();
  const recentWeeks = Math.min(12, Math.floor(records.length / 3)); // Entre 3-12 semanas
  const weeklyData: { volume: number; weight: number; date: Date }[] = [];

  // Recopilar datos por semana con fechas
  for (let i = 0; i < recentWeeks; i++) {
    const weekStart = startOfWeek(subWeeks(now, i), { locale: es });
    const weekEnd = endOfWeek(weekStart, { locale: es });
    const weekRecords = records.filter(r => {
      const recordDate = new Date(r.date);
      return recordDate >= weekStart && recordDate <= weekEnd;
    });

    if (weekRecords.length > 0) {
      const volume = weekRecords.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0);
      const avg1RM = weekRecords.reduce((sum, r) => {
        const oneRM = r.weight * (1 + Math.min(r.reps, 20) / 30);
        return sum + oneRM;
      }, 0) / weekRecords.length;

      weeklyData.push({ volume, weight: avg1RM, date: weekStart });
    }
  }

  if (weeklyData.length < 4) {
    // Generar predicciones básicas con datos limitados pero existentes
    return generateIntermediatePredictions(records, weeklyData);
  }

  // Ordenar por fecha (más antiguo primero) para regresión lineal correcta
  weeklyData.sort((a, b) => a.date.getTime() - b.date.getTime());

  // Calcular tendencias usando regresión lineal simple
  const calculateTrend = (values: number[]): number => {
    if (values.length < 2) return 0;

    const n = values.length;
    const xSum = values.reduce((sum, _, i) => sum + i, 0);
    const ySum = values.reduce((sum, val) => sum + val, 0);
    const xxSum = values.reduce((sum, _, i) => sum + i * i, 0);
    const xySum = values.reduce((sum, val, i) => sum + i * val, 0);

    const slope = (n * xySum - xSum * ySum) / (n * xxSum - xSum * xSum);
    return slope;
  };

  const volumeValues = weeklyData.map(d => d.volume);
  const weightValues = weeklyData.map(d => d.weight);

  const volumeTrend = calculateTrend(volumeValues);
  const strengthTrend = calculateTrend(weightValues);

  // Predicciones para próxima semana con validación
  // Usar los valores más recientes (últimos en el array ordenado)
  const currentVolume = volumeValues[volumeValues.length - 1] || 0;
  const currentWeight = weightValues[weightValues.length - 1] || 0;

  const nextWeekVolume = Math.max(0, currentVolume + volumeTrend);
  const nextWeekWeight = Math.max(0, currentWeight + strengthTrend);

  // Tasa de crecimiento mensual más realista
  const monthlyGrowthRate = strengthTrend * 4; // 4 semanas por mes

  // Análisis de tendencia mejorado - priorizar fuerza sobre volumen
  let trendAnalysis: 'mejorando' | 'estable' | 'empeorando' | 'insuficiente';

  // Normalizar tendencias a escalas comparables
  const normalizedVolumeTrend = Math.abs(currentVolume) > 0 ? (volumeTrend / currentVolume) * 100 : 0; // Porcentaje de cambio
  const normalizedStrengthTrend = Math.abs(currentWeight) > 0 ? (strengthTrend / currentWeight) * 100 : 0; // Porcentaje de cambio

  // Priorizar tendencia de fuerza (70%) sobre volumen (30%)
  const weightedTrend = (normalizedStrengthTrend * 0.7) + (normalizedVolumeTrend * 0.3);

  // Clasificar basado en la tendencia ponderada
  if (weightedTrend > 2) trendAnalysis = 'mejorando';
  else if (weightedTrend < -2) trendAnalysis = 'empeorando';
  else trendAnalysis = 'estable';

  // Si la fuerza está claramente mejorando, darle prioridad independientemente del volumen
  if (strengthTrend > 2) {
    trendAnalysis = 'mejorando';
  } else if (strengthTrend < -2) {
    trendAnalysis = 'empeorando';
  }

  // Predicción de PR mejorada
  const current1RMMax = Math.max(...records.map(r => r.weight * (1 + Math.min(r.reps, 20) / 30)));
  const predictedPRWeight = Math.max(current1RMMax, currentWeight + (strengthTrend * 3)); // 3 semanas de progreso

  // Tiempo estimado hasta próximo PR (en semanas)
  const prThreshold = current1RMMax * 1.025; // 2.5% de mejora mínima
  const timeToNextPR = strengthTrend > 0 ?
    Math.ceil((prThreshold - currentWeight) / strengthTrend) : 0;

  // Nivel de confianza basado en consistencia de datos
  const avgWeight = weightValues.reduce((sum, w) => sum + w, 0) / weightValues.length;
  const avgVolume = volumeValues.reduce((sum, v) => sum + v, 0) / volumeValues.length;
  const weightVariance = weightValues.reduce((sum, w) => sum + Math.pow(w - avgWeight, 2), 0) / weightValues.length;
  const volumeVariance = volumeValues.reduce((sum, v) => sum + Math.pow(v - avgVolume, 2), 0) / volumeValues.length;

  const dataConsistency = Math.max(0, Math.min(100, 100 - (weightVariance + volumeVariance) / 200));
  const trendStrength = Math.min(100, Math.abs(weightedTrend) * 10);
  const confidenceLevel = Math.round((dataConsistency * 0.6) + (trendStrength * 0.4));

  const prConfidence = Math.min(95, Math.max(15, confidenceLevel - Math.min(timeToNextPR, 8) * 5));

  // Riesgo de meseta mejorado
  const recentValues = weightValues.slice(-4); // Últimos 4 valores
  const recentAvg = recentValues.reduce((sum, w) => sum + w, 0) / recentValues.length;
  const recentVariance = recentValues.reduce((sum, w) => sum + Math.pow(w - recentAvg, 2), 0) / recentValues.length;
  const plateauRisk = recentVariance < 2 ? 85 :
    recentVariance < 8 ? 45 :
      recentVariance < 20 ? 25 : 10;

  // Recomendaciones personalizadas
  const recommendations: string[] = [];

  if (trendAnalysis === 'mejorando') {
    recommendations.push('Mantén la consistencia actual - estás progresando bien');
    if (plateauRisk > 60) {
      recommendations.push('Considera variar los estímulos para evitar meseta');
    }
  } else if (trendAnalysis === 'empeorando') {
    recommendations.push('Evalúa factores: descanso, nutrición, estrés');
    recommendations.push('Considera una semana de descarga activa');
  } else if (trendAnalysis === 'estable') {
    recommendations.push('Introduce variaciones en intensidad o volumen');
    recommendations.push('Revisa tu programación para estimular nuevo crecimiento');
  }

  if (timeToNextPR > 8) {
    recommendations.push('Enfócate en mejoras graduales y consistencia');
  } else if (timeToNextPR > 0 && timeToNextPR <= 4) {
    recommendations.push('Próximo PR cerca - mantén intensidad alta');
  }

  if (plateauRisk > 70) {
    recommendations.push('Alto riesgo de meseta - varía ejercicios o metodología');
  }

  return {
    nextWeekVolume: Math.round(nextWeekVolume),
    nextWeekWeight: Math.round(nextWeekWeight * 100) / 100,
    monthlyGrowthRate: Math.round(monthlyGrowthRate * 100) / 100,
    predictedPR: {
      weight: Math.round(predictedPRWeight * 100) / 100,
      confidence: Math.round(prConfidence)
    },
    plateauRisk: Math.round(plateauRisk),
    trendAnalysis,
    timeToNextPR: Math.max(0, timeToNextPR),
    confidenceLevel: Math.round(confidenceLevel),
    // Limitar volumeTrend a rangos razonables para evitar valores extremos
    volumeTrend: Math.max(-500, Math.min(500, Math.round(volumeTrend))),
    strengthTrend: Math.round(strengthTrend * 100) / 100,
    recommendations
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

  // Calcular intensidad de peso usando la función centralizada (más preciso y consistente)
  const averageIntensity = calculateIntensityScore(records);

  // Calcular intensidad de volumen basada en métricas más realistas
  const totalVolume = records.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0);
  const avgVolumePerWorkout = totalVolume / records.length;

  // Clasificar volumen por sesión de forma más realista
  // Basado en estándares típicos de entrenamiento
  const volumeIntensity = Math.min(100, Math.max(0, (avgVolumePerWorkout / 800) * 100));

  // Calcular intensidad de frecuencia de forma más equilibrada
  const thisWeekRecords = getThisWeekRecords(records);
  // Calcular días únicos en lugar de registros individuales
  const weeklyFrequency = new Set(thisWeekRecords.map(r => r.date.toDateString())).size;

  // Escala más realista: 3-5 sesiones por semana es óptimo
  let frequencyIntensity = 0;
  if (weeklyFrequency <= 1) {
    frequencyIntensity = 20;
  } else if (weeklyFrequency <= 2) {
    frequencyIntensity = 40;
  } else if (weeklyFrequency <= 3) {
    frequencyIntensity = 70;
  } else if (weeklyFrequency <= 4) {
    frequencyIntensity = 90;
  } else if (weeklyFrequency <= 5) {
    frequencyIntensity = 100;
  } else if (weeklyFrequency <= 6) {
    frequencyIntensity = 85; // Ligeramente menor porque puede ser excesivo
  } else {
    frequencyIntensity = 70; // Demasiado frecuente
  }

  // Calcular intensidad general con pesos más balanceados
  const overallScore = (averageIntensity * 0.4) + (volumeIntensity * 0.35) + (frequencyIntensity * 0.25);

  let overallIntensity: IntensityMetrics['overallIntensity'];
  if (overallScore >= 85) overallIntensity = 'Excesiva';
  else if (overallScore >= 70) overallIntensity = 'Alta';
  else if (overallScore >= 50) overallIntensity = 'Óptima';
  else overallIntensity = 'Baja';

  // Recomendaciones mejoradas basadas en análisis detallado
  const recommendations: string[] = [];

  // Recomendaciones para intensidad de peso
  if (averageIntensity < 50) {
    recommendations.push('Incrementar pesos gradualmente (5-10% cada 2 semanas)');
  } else if (averageIntensity > 90) {
    recommendations.push('Considerar trabajar con rangos de repeticiones más altos');
  }

  // Recomendaciones para volumen
  if (volumeIntensity < 40) {
    recommendations.push('Aumentar volumen por sesión (más series o ejercicios)');
  } else if (volumeIntensity > 90) {
    recommendations.push('Considerar reducir volumen para mejorar recuperación');
  }

  // Recomendaciones para frecuencia
  if (weeklyFrequency < 3) {
    recommendations.push('Incrementar frecuencia a 3-4 sesiones semanales');
  } else if (weeklyFrequency > 6) {
    recommendations.push('Reducir frecuencia e incluir más días de descanso');
  }

  // Recomendaciones específicas para intensidad general
  if (overallScore < 50) {
    recommendations.push('Planificar progresión sistemática en peso y volumen');
  } else if (overallScore > 90) {
    recommendations.push('Implementar semana de descarga cada 4-6 semanas');
  }

  if (recommendations.length === 0) {
    recommendations.push('Mantener intensidad actual - está en rango óptimo');
  }

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