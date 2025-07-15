import { differenceInDays, endOfWeek, startOfWeek, subWeeks } from 'date-fns';
import { es } from 'date-fns/locale';
import type { WorkoutRecord } from '../../interfaces';
import { calculateIntensityScore } from './category-analysis';

// ========================================
// CONSTANTES PARA CÁLCULOS DE PREDICCIÓN
// ========================================

/** Constantes para cálculos de 1RM */
export const ONE_RM_CONSTANTS = {
  /** Factor Epley para cálculo de 1RM: peso * (1 + reps/30) */
  EPLEY_FACTOR: 30,
  /** Factor Brzycki A: 1.0278 */
  BRZYCKI_A: 1.0278,
  /** Factor Brzycki B: 0.0278 */
  BRZYCKI_B: 0.0278,
  /** Máximo número de repeticiones para cálculo confiable de 1RM */
  MAX_REPS_FOR_1RM: 20
} as const;

/** Constantes temporales */
export const TIME_CONSTANTS = {
  /** Semanas por mes (52 semanas / 12 meses) */
  WEEKS_PER_MONTH: 52 / 12,
  /** Días por semana */
  DAYS_PER_WEEK: 7,
  /** Milisegundos por día */
  MS_PER_DAY: 1000 * 60 * 60 * 24,
  /** Días mínimos para análisis temporal */
  MIN_DAYS_FOR_ANALYSIS: 14,
  /** Entrenamientos mínimos para predicciones confiables */
  MIN_WORKOUTS_FOR_PREDICTIONS: 6
} as const;

/** Constantes para validación de progreso */
export const PROGRESS_CONSTANTS = {
  /** Umbral mínimo para considerar un PR (2.5%) */
  PR_THRESHOLD_PERCENT: 0.025,
  /** Máximo crecimiento semanal realista en kg */
  MAX_WEEKLY_STRENGTH_GAIN: 2,
  /** Máximo crecimiento mensual realista en kg */
  MAX_MONTHLY_GROWTH: 8,
  /** Máximo cambio de volumen semanal en kg */
  MAX_WEEKLY_VOLUME_CHANGE: 100,
  /** Porcentaje máximo de incremento de peso en 2 semanas (seguridad) */
  MAX_SAFE_WEIGHT_INCREASE_2WEEKS: 20
} as const;

/** Constantes para niveles de experiencia */
export const EXPERIENCE_CONSTANTS = {
  /** Umbral de entrenamientos para principiante */
  BEGINNER_WORKOUT_THRESHOLD: 10,
  /** Umbral de entrenamientos para intermedio */
  INTERMEDIATE_WORKOUT_THRESHOLD: 30,
  /** Umbral de semanas para principiante */
  BEGINNER_WEEKS_THRESHOLD: 12,
  /** Umbral de semanas para intermedio */
  INTERMEDIATE_WEEKS_THRESHOLD: 52,
  /** Peso máximo umbral para principiante */
  BEGINNER_WEIGHT_THRESHOLD: 40,
  /** Peso máximo umbral para intermedio */
  INTERMEDIATE_WEIGHT_THRESHOLD: 80,
  /** Variedad de ejercicios umbral para principiante */
  BEGINNER_EXERCISE_VARIETY: 5,
  /** Variedad de ejercicios umbral para intermedio */
  INTERMEDIATE_EXERCISE_VARIETY: 12
} as const;

/** Constantes para cálculos de confianza */
export const CONFIDENCE_CONSTANTS = {
  /** Confianza base mínima */
  BASE_CONFIDENCE_MIN: 10 as number,
  /** Confianza base máxima */
  BASE_CONFIDENCE_MAX: 95 as number,
  /** Penalización máxima por volatilidad */
  MAX_VOLATILITY_PENALTY: 20 as number,
  /** Incremento de confianza por datos adicionales (principiantes) */
  BEGINNER_CONFIDENCE_PER_WORKOUT: 5 as number,
  /** Incremento de confianza por datos adicionales (intermedios) */
  INTERMEDIATE_CONFIDENCE_PER_WORKOUT: 2 as number,
  /** Incremento de confianza por datos semanales */
  WEEKLY_DATA_CONFIDENCE_BONUS: 5 as number
};

// ========================================
// FUNCIONES UTILITARIAS MEJORADAS
// ========================================

/**
 * Calcula el 1RM usando la fórmula de Epley (estándar de la industria)
 * Fórmula: peso * (1 + repeticiones/30)
 * Válida para 1-20 repeticiones
 */
export const calculate1RMEpley = (weight: number, reps: number): number => {
  if (weight <= 0 || reps <= 0) return 0;
  const cappedReps = Math.min(reps, ONE_RM_CONSTANTS.MAX_REPS_FOR_1RM);
  return weight * (1 + cappedReps / ONE_RM_CONSTANTS.EPLEY_FACTOR);
};

/**
 * Calcula el 1RM usando la fórmula de Brzycki (alternativa más precisa para altas repeticiones)
 * Fórmula: peso / (1.0278 - 0.0278 * repeticiones)
 * Válida para 2-20 repeticiones
 */
export const calculate1RMBrzycki = (weight: number, reps: number): number => {
  if (weight <= 0 || reps <= 1) return weight; // Para 1 rep, el 1RM es el peso mismo
  const cappedReps = Math.min(reps, ONE_RM_CONSTANTS.MAX_REPS_FOR_1RM);
  const denominator = ONE_RM_CONSTANTS.BRZYCKI_A - (ONE_RM_CONSTANTS.BRZYCKI_B * cappedReps);
  return denominator > 0 ? weight / denominator : weight;
};

/**
 * Calcula el 1RM usando el método más apropiado según las repeticiones
 * - 1-5 reps: Epley
 * - 6+ reps: Brzycki (más preciso para altas repeticiones)
 */
export const calculateOptimal1RM = (weight: number, reps: number): number => {
  if (weight <= 0 || reps <= 0) return 0;

  // Para repeticiones bajas, usar Epley
  if (reps <= 5) {
    return calculate1RMEpley(weight, reps);
  }

  // Para repeticiones altas, usar Brzycki
  return calculate1RMBrzycki(weight, reps);
};

/**
 * Valida que un registro de entrenamiento sea válido para cálculos
 */
export const isValidRecord = (record: WorkoutRecord): boolean => {
  // Validaciones básicas
  if (!(record.weight > 0 &&
    record.reps > 0 &&
    record.sets > 0 &&
    isFinite(record.weight) &&
    isFinite(record.reps) &&
    isFinite(record.sets) &&
    record.date instanceof Date &&
    !isNaN(record.date.getTime()))) {
    return false;
  }

  // CORRECCIÓN: Rechazar fechas futuras que distorsionan cálculos
  const now = new Date();
  const tolerance = 24 * 60 * 60 * 1000; // 1 día de tolerancia para zona horaria

  if (record.date.getTime() > now.getTime() + tolerance) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`⚠️ Registro con fecha futura ignorado: ${record.date.toISOString().split('T')[0]} (peso: ${record.weight}kg)`);
    }
    return false;
  }

  return true;
};

/**
 * Filtra registros válidos y los ordena cronológicamente
 */
export const getValidSortedRecords = (records: WorkoutRecord[]): WorkoutRecord[] => {
  return records
    .filter(isValidRecord)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

/**
 * Determina el nivel de experiencia basado en múltiples factores
 */
export const determineExperienceLevel = (records: WorkoutRecord[]): 'beginner' | 'intermediate' | 'advanced' => {
  const validRecords = getValidSortedRecords(records);

  if (validRecords.length === 0) return 'beginner';

  const totalWeeks = Math.max(1, validRecords.length / 3); // Estimación: ~3 entrenamientos por semana
  const maxWeight = Math.max(...validRecords.map(r => r.weight));
  const exerciseVariety = new Set(validRecords.map(r => r.exercise?.name || 'unknown')).size;

  // Criterios para principiante
  const isBeginner = validRecords.length < EXPERIENCE_CONSTANTS.BEGINNER_WORKOUT_THRESHOLD ||
    totalWeeks < EXPERIENCE_CONSTANTS.BEGINNER_WEEKS_THRESHOLD ||
    maxWeight < EXPERIENCE_CONSTANTS.BEGINNER_WEIGHT_THRESHOLD ||
    exerciseVariety < EXPERIENCE_CONSTANTS.BEGINNER_EXERCISE_VARIETY;

  if (isBeginner) return 'beginner';

  // Criterios para intermedio
  const isIntermediate = validRecords.length < EXPERIENCE_CONSTANTS.INTERMEDIATE_WORKOUT_THRESHOLD ||
    totalWeeks < EXPERIENCE_CONSTANTS.INTERMEDIATE_WEEKS_THRESHOLD ||
    maxWeight < EXPERIENCE_CONSTANTS.INTERMEDIATE_WEIGHT_THRESHOLD ||
    exerciseVariety < EXPERIENCE_CONSTANTS.INTERMEDIATE_EXERCISE_VARIETY;

  if (isIntermediate) return 'intermediate';

  return 'advanced';
};

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
  peakPerformanceIndicators: Array<{
    type: 'excellent' | 'good' | 'warning' | 'critical';
    icon: string;
    title: string;
    description: string;
    value?: string;
    progress?: number;
    category: 'consistency' | 'progress' | 'intensity' | 'recovery' | 'volume' | 'prediction' | 'plateau' | 'safety';
  }>;
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

  // Recomendaciones basadas en análisis mejorado
  const recommendations: string[] = [];

  // Análisis de eficiencia temporal más realista
  if (timeEfficiencyScore < 30) {
    recommendations.push('Volumen por sesión muy bajo - considera añadir ejercicios o series');
  } else if (timeEfficiencyScore < 50) {
    recommendations.push('Aumentar gradualmente la intensidad o volumen por sesión');
  } else if (timeEfficiencyScore > 90) {
    recommendations.push('Alto volumen por sesión - asegúrate de recuperar adecuadamente');
  }

  // Análisis de eficiencia por serie más contextual
  const avgVolumePerSet = setsToVolumeRatio;
  if (avgVolumePerSet < 30) {
    recommendations.push('Considerar aumentar peso o repeticiones por serie');
  } else if (avgVolumePerSet > 150) {
    recommendations.push('Series muy intensas - monitorea técnica y fatiga');
  }

  // Análisis de progresión de peso más inteligente
  if (volumeToWeightRatio > 200) {
    recommendations.push('Ratio volumen/peso alto - oportunidad de aumentar cargas');
  } else if (volumeToWeightRatio < 50) {
    recommendations.push('Bajo volumen relativo - considera añadir más series o ejercicios');
  }

  // Si no hay recomendaciones específicas, dar feedback positivo
  if (recommendations.length === 0) {
    recommendations.push('Eficiencia de entrenamiento en rango óptimo');
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

  // OPCIÓN A: Usar semanas completas (excluyendo semana actual) para consistencia temporal
  const now = new Date();
  const currentWeekStart = startOfWeek(now, { locale: es });

  // Semana anterior completa (base de referencia)
  const lastWeekStart = startOfWeek(subWeeks(now, 1), { locale: es });
  const lastWeekEnd = endOfWeek(subWeeks(now, 1), { locale: es });
  const recentRecords = records.filter(r => {
    const recordDate = new Date(r.date);
    return recordDate >= lastWeekStart && recordDate <= lastWeekEnd;
  });

  // Semana anterior a la anterior (para comparación)
  const previousWeekStart = startOfWeek(subWeeks(now, 2), { locale: es });
  const previousWeekEnd = endOfWeek(subWeeks(now, 2), { locale: es });
  const olderRecords = records.filter(r => {
    const recordDate = new Date(r.date);
    return recordDate >= previousWeekStart && recordDate <= previousWeekEnd;
  });

  if (process.env.NODE_ENV === 'development') {
    console.log(`[OPCIÓN A] 🔄 Análisis Recuperación:`);
    console.log(`📅 Semana anterior: ${lastWeekStart.toISOString().split('T')[0]} - ${lastWeekEnd.toISOString().split('T')[0]} (${recentRecords.length} registros)`);
    console.log(`📅 Semana previa: ${previousWeekStart.toISOString().split('T')[0]} - ${previousWeekEnd.toISOString().split('T')[0]} (${olderRecords.length} registros)`);
    console.log(`📅 Excluida semana actual: desde ${currentWeekStart.toISOString().split('T')[0]}`);
  }

  // **CORRECCIÓN CLAVE**: Calcular tanto volumen total (para stress) como promedio por sesión (para comparación justa)
  let recentVolume = recentRecords.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0);
  let olderVolume = olderRecords.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0);

  // OPCIÓN A: Fallback si no hay datos en semanas anteriores completas
  if (recentRecords.length === 0 || olderRecords.length === 0) {
    // Usar últimos 7-14 días como fallback
    const recent7Days = records.filter(r => {
      const daysDiff = differenceInDays(now, new Date(r.date));
      return daysDiff >= 0 && daysDiff <= 7;
    });
    const older7Days = records.filter(r => {
      const daysDiff = differenceInDays(now, new Date(r.date));
      return daysDiff >= 7 && daysDiff <= 14;
    });

    if (recentRecords.length === 0 && recent7Days.length > 0) {
      recentVolume = recent7Days.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0);
      // Actualizar recentRecords para cálculos posteriores
      recentRecords.length = 0;
      recentRecords.push(...recent7Days);
    }

    if (olderRecords.length === 0 && older7Days.length > 0) {
      olderVolume = older7Days.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0);
    }

    if (process.env.NODE_ENV === 'development' && (recent7Days.length > 0 || older7Days.length > 0)) {
      console.log(`[OPCIÓN A] ⚠️ Fallback recuperación: usando últimos 7-14 días`);
    }
  }

  const recentAvgVolume = recentRecords.length > 0 ? recentVolume / recentRecords.length : 0;
  const olderAvgVolume = olderRecords.length > 0 ? olderVolume / olderRecords.length : 0;

  const volumeChange = olderAvgVolume > 0 ? ((recentAvgVolume - olderAvgVolume) / olderAvgVolume) * 100 : 0;
  const volumeDropIndicators = volumeChange < -15; // Caída > 15%

  // Calcular días desde último entrenamiento
  const lastWorkout = new Date(Math.max(...records.map(r => new Date(r.date).getTime())));
  const recoveryDays = differenceInDays(new Date(), lastWorkout);

  // OPCIÓN A: Índice de fatiga basado en semana anterior completa (no semana actual)
  // Usar recentRecords (semana anterior) en lugar de semana actual
  const weeklyFrequency = new Set(recentRecords.map(r => r.date.toDateString())).size;
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

  // Calcular stress factors más realistas basados en niveles actuales
  const stressFactors: FatigueAnalysis['stressFactors'] = {
    // Volume stress: basado en el volumen actual relativo + cambios
    volumeStress: Math.min(100, Math.max(0,
      // Base stress por volumen semanal (normalizado)
      Math.min(60, (recentVolume / 1000) * 10) +
      // Stress adicional por aumentos súbitos
      (volumeChange > 15 ? (volumeChange - 15) * 2 : 0)
    )),

    // Frequency stress: basado en frecuencia actual
    frequencyStress: Math.min(100, Math.max(0,
      weeklyFrequency <= 2 ? 10 :  // Muy poca frecuencia = bajo stress
        weeklyFrequency <= 3 ? 30 :  // Frecuencia normal = stress moderado
          weeklyFrequency <= 4 ? 50 :  // Frecuencia buena = stress medio-alto
            weeklyFrequency <= 5 ? 70 :  // Frecuencia alta = stress alto
              weeklyFrequency <= 6 ? 85 :  // Frecuencia muy alta = stress muy alto
                100  // Entrenamiento diario = stress máximo
    )),

    // Intensity stress: basado en el índice de fatiga
    intensityStress: Math.min(100, Math.max(0, fatigueIndex)),

    // Recovery stress: basado en tiempo desde último entrenamiento
    recoveryStress: Math.min(100, Math.max(0,
      recoveryDays === 0 ? 80 :      // Sin descanso = alto stress
        recoveryDays === 1 ? 40 :      // 1 día descanso = stress medio
          recoveryDays === 2 ? 20 :      // 2 días descanso = stress bajo
            recoveryDays >= 3 ? 10 : 0     // 3+ días descanso = stress muy bajo
    ))
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
  const predictedRecoveryTime = Math.round(Math.max(8, Math.min(72,
    (fatigueIndex / 100) * 48 + (recoveryDays === 0 ? 12 : 0)
  )));

  // Análisis de historial de fatiga usando semanas completas CON CONTEXTO
  // CORRECCIÓN: Considerar si el aumento es progreso controlado o deterioro
  let trend: FatigueAnalysis['fatigueHistory']['trend'];

  if (volumeChange > 25) {
    trend = 'Empeorando'; // Aumento excesivo >25%
  } else if (volumeChange > 15) {
    // Aumento moderado 15-25%: evaluar contexto
    // Si hay otros indicadores positivos, interpretar como progreso
    if (fatigueIndex < 50 && recoveryDays <= 2) {
      trend = 'Mejorando'; // Progreso acelerado controlado
    } else {
      trend = 'Empeorando'; // Aumento problemático
    }
  } else if (volumeChange < -15) {
    trend = 'Mejorando'; // Reducción significativa
  } else {
    trend = 'Estable'; // Cambio normal ±15%
  }

  const fatigueHistory: FatigueAnalysis['fatigueHistory'] = {
    trend,
    consistency: Math.round(Math.min(100, Math.max(0, 100 - Math.abs(volumeChange))) * 10) / 10
  };

  if (process.env.NODE_ENV === 'development') {
    console.log(`[OPCIÓN A] 📊 Resultados Recuperación:`);
    console.log(`⏱️ Tiempo recuperación: ${predictedRecoveryTime}h`);
    console.log(`📉 Cambio volumen: ${volumeChange.toFixed(1)}% (${fatigueHistory.trend})`);
    console.log(`🎯 Consistencia: ${fatigueHistory.consistency}%`);
    console.log(`💪 Índice fatiga: ${fatigueIndex} (${fatigueIndex < 50 ? 'BAJO' : 'ALTO'})`);
    console.log(`😴 Días recuperación: ${recoveryDays} (${recoveryDays <= 2 ? 'RECIENTE' : 'EXTENDIDO'})`);
    console.log(`🧠 Contexto: Vol+${volumeChange.toFixed(1)}% + Fatiga=${fatigueIndex} + Recup=${recoveryDays}d → ${fatigueHistory.trend}`);
    console.log(`📅 Frecuencia semanal: ${weeklyFrequency} días únicos`);
    console.log(`🔍 Vol reciente: ${recentVolume}kg, Vol anterior: ${olderVolume}kg`);
    console.log(`📊 Promedio reciente: ${recentAvgVolume.toFixed(1)}kg/sesión vs ${olderAvgVolume.toFixed(1)}kg/sesión`);
  }



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

  // **DETECCIÓN DE DATOS INSUFICIENTES**: Verificar rango temporal de datos
  const sortedRecords = [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const firstDate = new Date(sortedRecords[0].date);
  const lastDate = new Date(sortedRecords[sortedRecords.length - 1].date);
  const totalDays = Math.ceil((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));

  const now = new Date();
  const periods = [
    {
      name: 'Esta semana',
      getRecords: () => getThisWeekRecords(records),
      getPrevRecords: () => getLastWeekRecords(records),
      minDaysRequired: 14 // Necesita al menos 2 semanas de datos
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
      },
      minDaysRequired: 28 // Necesita al menos 4 semanas de datos
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
      },
      minDaysRequired: 56 // Necesita al menos 8 semanas de datos
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
      },
      minDaysRequired: 168 // Necesita al menos 24 semanas de datos
    }
  ];

  return periods.map(period => {
    const currentRecords = period.getRecords();
    const prevRecords = period.getPrevRecords();

    // Validación silenciosa de datos

    const currentWorkouts = currentRecords.length;
    const prevWorkouts = prevRecords.length;

    let totalVolume = 0;
    let avgWeight = 0;
    let volumeChange = 0;
    let strengthChange = 0;
    let improvement = 0;

    // **VALIDACIÓN DE DATOS SUFICIENTES**
    const hasEnoughData = totalDays >= period.minDaysRequired;
    const hasValidComparison = currentRecords.length >= 2 && prevRecords.length >= 2;

    if (currentRecords.length > 0) {
      totalVolume = currentRecords.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0);
      avgWeight = currentRecords.reduce((sum, r) => {
        const oneRM = calculateOptimal1RM(r.weight, r.reps);
        return sum + oneRM;
      }, 0) / currentRecords.length;

      // **CORRECCIÓN CLAVE**: Solo calcular tendencias si hay datos suficientes
      if (hasEnoughData && hasValidComparison) {
        const currentAvgVolumePerSession = totalVolume / currentRecords.length;

        const prevVolume = prevRecords.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0);
        const prevAvgVolumePerSession = prevVolume / prevRecords.length;

        const prevAvg1RM = prevRecords.reduce((sum, r) => {
          const oneRM = calculateOptimal1RM(r.weight, r.reps);
          return sum + oneRM;
        }, 0) / prevRecords.length;

        volumeChange = prevAvgVolumePerSession > 0 ? ((currentAvgVolumePerSession - prevAvgVolumePerSession) / prevAvgVolumePerSession) * 100 : 0;
        strengthChange = prevAvg1RM > 0 ? ((avgWeight - prevAvg1RM) / prevAvg1RM) * 100 : 0;
        improvement = (volumeChange + strengthChange) / 2;

        // Comparación válida realizada
      } else {
        // No calcular cambios si no hay datos suficientes
        volumeChange = 0;
        strengthChange = 0;
        improvement = 0;
      }
    }

    return {
      periodName: period.name,
      workouts: currentWorkouts,
      totalVolume,
      avgWeight,
      improvement,
      volumeChange,
      strengthChange
    };
  });
};

// ========================================
// FUNCIONES AUXILIARES PARA PREDICCIONES
// ========================================

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
 * Obtiene registros de la última semana completa (excluyendo semana actual)
 */
const getLastCompleteWeekRecords = (records: WorkoutRecord[]): WorkoutRecord[] => {
  if (records.length === 0) return [];

  const weekGroups = new Map<string, WorkoutRecord[]>();
  const now = new Date();

  records.forEach(record => {
    const date = new Date(record.date);
    const weekStart = startOfWeek(date, { locale: es });
    const weekKey = weekStart.toISOString().split('T')[0];

    if (!weekGroups.has(weekKey)) {
      weekGroups.set(weekKey, []);
    }
    weekGroups.get(weekKey)!.push(record);
  });

  // Ordenar semanas por fecha y excluir la semana actual
  const sortedWeeks = Array.from(weekGroups.entries())
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .filter(([weekKey]) => {
      const weekStart = new Date(weekKey);
      const currentWeekStart = startOfWeek(now, { locale: es });
      return weekStart.getTime() < currentWeekStart.getTime();
    });

  // Devolver registros de la última semana completa
  return sortedWeeks.length > 0 ? sortedWeeks[sortedWeeks.length - 1][1] : [];
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
  const lastCompleteWeekRecords = getLastCompleteWeekRecords(validRecords);

  let current1RMMax = 0;
  if (lastCompleteWeekRecords.length > 0) {
    // Usar 1RM promedio de la última semana completa
    const lastWeek1RMs = lastCompleteWeekRecords.map(r => calculateOptimal1RM(r.weight, r.reps));
    current1RMMax = lastWeek1RMs.reduce((sum, rm) => sum + rm, 0) / lastWeek1RMs.length;
  } else {
    // Fallback: si no hay semana completa anterior, usar últimos 5 entrenamientos
    const recentRecords = validRecords.slice(-5);
    if (recentRecords.length > 0) {
      const recent1RMs = recentRecords.map(r => calculateOptimal1RM(r.weight, r.reps));
      current1RMMax = recent1RMs.reduce((sum, rm) => sum + rm, 0) / recent1RMs.length;
    }
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
 * Calcula progresión general entre primer y último registro
 */
const calculateOverallProgress = (validRecords: WorkoutRecord[], daysBetween: number) => {
  const firstRecord = validRecords[0];
  const lastRecord = validRecords[validRecords.length - 1];

  const first1RM = calculateOptimal1RM(firstRecord.weight, firstRecord.reps);
  const last1RM = calculateOptimal1RM(lastRecord.weight, lastRecord.reps);

  const overallProgress = first1RM > 0 ? ((last1RM - first1RM) / first1RM) * 100 : 0;

  return { first1RM, last1RM, overallProgress };
};

/**
 * Calcula tendencias de fuerza y volumen basadas en el nivel de experiencia
 */
const calculateTrends = (
  validRecords: WorkoutRecord[],
  experienceLevel: 'beginner' | 'intermediate' | 'advanced',
  overallProgress: number,
  avgVolume: number,
  avgWeight: number,
  daysBetween: number
): { volumeTrend: number; strengthTrend: number; weeklyDataLength: number } => {
  let volumeTrend = 0;
  let strengthTrend = 0;
  let weeklyDataLength = 0;

  if (experienceLevel === 'beginner') {
    // Para principiantes: estimaciones optimistas basadas en progresión típica
    const beginnerGrowthRate = validRecords.length >= 3 ?
      Math.max(0.5, Math.min(2, overallProgress * 0.1)) : 1;

    strengthTrend = beginnerGrowthRate * 0.25;
    volumeTrend = avgVolume * 0.05;

  } else if (experienceLevel === 'intermediate') {
    // Para intermedios: calcular basado en datos semanales si están disponibles
    const weeklyData = groupRecordsByWeek(validRecords);
    weeklyDataLength = weeklyData.length;

    if (weeklyData.length >= 2) {
      const recentData = weeklyData.slice(-2);

      // CORRECCIÓN CRÍTICA: Detectar semanas incompletas
      const now = new Date();
      const recentWeekStart = new Date(recentData[1].date);
      const recentWeekEnd = endOfWeek(recentWeekStart, { locale: es });

      // CORRECCIÓN: Detectar semana incompleta basándose en los datos reales
      // En lugar de usar la fecha del sistema, usar la fecha del último registro
      const lastRecordDate = new Date(validRecords[validRecords.length - 1].date);
      const daysSinceLastRecord = Math.ceil((now.getTime() - lastRecordDate.getTime()) / (1000 * 60 * 60 * 24));

      // Si el último registro es muy reciente (≤2 días) y la semana no está en el pasado lejano, 
      // entonces probablemente es una semana incompleta
      const isCurrentWeekIncomplete = daysSinceLastRecord <= 2 &&
        Math.abs(recentWeekStart.getTime() - now.getTime()) < (30 * 24 * 60 * 60 * 1000); // Menos de 30 días de diferencia

      // Calcular volumen promedio por sesión directamente desde datos agrupados
      const avgWorkoutsPerWeek = validRecords.length / weeklyData.length;

      let recentVolumePerSession: number;
      let previousVolumePerSession: number;

      if (isCurrentWeekIncomplete) {
        // SEMANA ACTUAL INCOMPLETA: Usar enfoque alternativo
        // Calcular días únicos de entrenamiento en la semana reciente
        const recentWeekRecordsCount = validRecords.filter(r => {
          const rDate = new Date(r.date);
          return rDate >= recentWeekStart && rDate <= recentWeekEnd;
        }).length;

        const uniqueDaysInRecentWeek = new Set(
          validRecords
            .filter(r => {
              const rDate = new Date(r.date);
              return rDate >= recentWeekStart && rDate <= recentWeekEnd;
            })
            .map(r => new Date(r.date).toDateString())
        ).size;

        // Si hay pocos días únicos comparado con el promedio, probablemente está incompleta
        const avgDaysPerWeek = Math.max(3, avgWorkoutsPerWeek / 2); // Estimar días únicos por semana
        const projectedMultiplier = Math.max(1, avgDaysPerWeek / Math.max(1, uniqueDaysInRecentWeek));
        const projectedRecentVolume = recentData[1].volume * Math.min(3, projectedMultiplier); // Límite x3 máximo

        recentVolumePerSession = projectedRecentVolume / avgWorkoutsPerWeek;
        previousVolumePerSession = recentData[0].volume / avgWorkoutsPerWeek;
      } else {
        // AMBAS SEMANAS COMPLETAS: Comparación normal
        recentVolumePerSession = recentData[1].volume / avgWorkoutsPerWeek;
        previousVolumePerSession = recentData[0].volume / avgWorkoutsPerWeek;
      }

      const recentWeight = recentData[1].weight;
      const previousWeight = recentData[0].weight;

      // CORRECCIÓN CRÍTICA: Tendencia de volumen realista
      // La diferencia directa puede ser excesiva, especialmente con semanas incompletas
      const rawVolumeTrend = recentVolumePerSession - previousVolumePerSession;

      // Aplicar límites realistas inmediatamente
      volumeTrend = Math.max(-50, Math.min(50, rawVolumeTrend)); // Máximo ±50kg/sem

      // Si la tendencia es extrema, usar enfoque más conservador
      if (Math.abs(rawVolumeTrend) > 100) {
        // Usar porcentaje del volumen total en lugar de diferencia absoluta
        const percentageChange = (recentVolumePerSession - previousVolumePerSession) / previousVolumePerSession;
        volumeTrend = Math.max(-20, Math.min(20, previousVolumePerSession * Math.max(-0.2, Math.min(0.2, percentageChange))));
      }

      strengthTrend = Math.max(-5, Math.min(5, recentWeight - previousWeight)); // Máximo ±5kg/sem
    } else {
      const weeklyStrengthChange = overallProgress > 0 ?
        (overallProgress * 0.01 * avgWeight) / Math.max(1, daysBetween / TIME_CONSTANTS.DAYS_PER_WEEK) : 0;
      strengthTrend = weeklyStrengthChange;
      volumeTrend = avgVolume * 0.05;
    }

  } else { // advanced
    // Para avanzados: usar regresión lineal con VOLUMEN PROMEDIO POR SESIÓN
    const weeklyData = groupRecordsByWeek(validRecords);
    weeklyDataLength = weeklyData.length;

    if (weeklyData.length >= 4) {
      // CORRECCIÓN CRÍTICA: Calcular volumen promedio por sesión para cada semana
      const volumePerSessionValues: number[] = [];
      const weightValues = weeklyData.map(d => d.weight);

      weeklyData.forEach(weekData => {
        // Contar entrenamientos de esta semana específica
        const weekStart = new Date(weekData.date);
        const weekRecordsCount = validRecords.filter(r => {
          const recordWeekStart = startOfWeek(new Date(r.date), { locale: es });
          return recordWeekStart.getTime() === weekStart.getTime();
        }).length;

        // Calcular volumen promedio por sesión para esta semana
        const volumePerSession = weekRecordsCount > 0 ? weekData.volume / weekRecordsCount : 0;
        volumePerSessionValues.push(volumePerSession);
      });

      // Aplicar regresión lineal a VOLUMEN PROMEDIO POR SESIÓN
      const rawVolumeTrend = calculateLinearTrend(volumePerSessionValues);
      const rawStrengthTrend = calculateLinearTrend(weightValues);

      // Limitar inmediatamente los resultados de regresión lineal
      volumeTrend = Math.max(-avgVolume * 0.2, Math.min(avgVolume * 0.2, rawVolumeTrend));
      strengthTrend = Math.max(-1, Math.min(1, rawStrengthTrend));
    } else {
      strengthTrend = overallProgress > 0 ?
        (overallProgress * 0.01 * avgWeight) / Math.max(1, daysBetween / TIME_CONSTANTS.DAYS_PER_WEEK) : 0;
      volumeTrend = avgVolume * 0.03;
    }
  }

  // Aplicar límites realistas más conservadores
  // Limitar cambios de volumen a un rango más realista basado en el volumen actual
  const maxVolumeChange = Math.max(20, avgVolume * 0.15); // Máximo 15% del volumen promedio o 20kg
  volumeTrend = Math.max(-maxVolumeChange, Math.min(maxVolumeChange, volumeTrend));

  // Mantener límites de fuerza pero más conservadores
  strengthTrend = Math.max(-PROGRESS_CONSTANTS.MAX_WEEKLY_STRENGTH_GAIN,
    Math.min(PROGRESS_CONSTANTS.MAX_WEEKLY_STRENGTH_GAIN, strengthTrend));

  // Validación adicional: Si no hay suficientes datos, ser más conservador
  if (validRecords.length < 10) {
    volumeTrend = Math.max(-10, Math.min(10, volumeTrend));
    strengthTrend = Math.max(-0.5, Math.min(0.5, strengthTrend));
  }

  return { volumeTrend, strengthTrend, weeklyDataLength };
};

/**
 * Determina el análisis de tendencia general
 */
const determineTrendAnalysis = (
  validRecords: WorkoutRecord[],
  strengthTrend: number,
  volumeTrend: number,
  avgWeight: number,
  avgVolume: number
): 'mejorando' | 'estable' | 'empeorando' | 'insuficiente' => {
  if (validRecords.length < 3) {
    return 'insuficiente';
  }

  const normalizedStrengthTrend = avgWeight > 0 ? (strengthTrend / avgWeight) * 100 : 0;
  const normalizedVolumeTrend = avgVolume > 0 ? (volumeTrend / avgVolume) * 100 : 0;
  const weightedTrend = (normalizedStrengthTrend * 0.7) + (normalizedVolumeTrend * 0.3);

  // Override por fuerza clara
  if (strengthTrend >= 1.5) return 'mejorando';
  if (strengthTrend <= -1.5) return 'empeorando';

  if (weightedTrend > 1.5) return 'mejorando';
  if (weightedTrend < -1.5) return 'empeorando';

  return 'estable';
};

/**
 * Calcula el nivel de confianza basado en múltiples factores
 */
const calculateConfidenceLevel = (
  experienceLevel: 'beginner' | 'intermediate' | 'advanced',
  validRecords: WorkoutRecord[],
  weeklyDataLength: number,
  avgWeight: number
): number => {
  let baseConfidence = CONFIDENCE_CONSTANTS.BASE_CONFIDENCE_MIN;

  if (experienceLevel === 'beginner') {
    baseConfidence = Math.min(80, Math.max(30, 25 + (validRecords.length * CONFIDENCE_CONSTANTS.BEGINNER_CONFIDENCE_PER_WORKOUT)));
  } else if (experienceLevel === 'intermediate') {
    baseConfidence = Math.min(70, Math.max(40, 30 + (validRecords.length * CONFIDENCE_CONSTANTS.INTERMEDIATE_CONFIDENCE_PER_WORKOUT) + (weeklyDataLength * CONFIDENCE_CONSTANTS.WEEKLY_DATA_CONFIDENCE_BONUS)));
  } else {
    baseConfidence = Math.min(90, Math.max(50, 40 + validRecords.length + (weeklyDataLength * 8)));
  }

  // Ajustar confianza por consistencia de datos
  const weightVariance = validRecords.length > 1 ?
    validRecords.reduce((sum, r) => sum + Math.pow(r.weight - avgWeight, 2), 0) / validRecords.length : 0;
  const volatilityPenalty = Math.min(CONFIDENCE_CONSTANTS.MAX_VOLATILITY_PENALTY, Math.sqrt(weightVariance));

  return Math.max(CONFIDENCE_CONSTANTS.BASE_CONFIDENCE_MIN,
    Math.min(CONFIDENCE_CONSTANTS.BASE_CONFIDENCE_MAX, baseConfidence - volatilityPenalty));
};

/**
 * Calcula las predicciones para la próxima semana
 * CORREGIDO: Distinción clara entre peso de trabajo y 1RM
 */
const calculateNextWeekPredictions = (
  validRecords: WorkoutRecord[],
  strengthTrend: number,
  volumeTrend: number,
  avgVolume: number,
  current1RMMax: number
): { nextWeekWeight: number; nextWeekVolume: number } => {
  // CORRECCIÓN: Usar misma base temporal que calculateBasicMetrics (última semana completa)
  const lastCompleteWeekRecords = getLastCompleteWeekRecords(validRecords);

  let avgRecentWorking = 0;
  let maxRecentWorking = 0;

  if (lastCompleteWeekRecords.length > 0) {
    // Usar peso de trabajo promedio de la última semana completa
    const lastWeekWorkingWeights = lastCompleteWeekRecords.map(r => r.weight);
    avgRecentWorking = lastWeekWorkingWeights.reduce((sum, w) => sum + w, 0) / lastWeekWorkingWeights.length;
    maxRecentWorking = Math.max(...lastWeekWorkingWeights);

    if (process.env.NODE_ENV === 'development') {
      console.log(`[OPCIÓN A] 🏋️ Peso trabajo semana anterior: ${avgRecentWorking.toFixed(1)}kg (promedio), ${maxRecentWorking}kg (máximo)`);
    }
  } else {
    // Fallback: últimos 5 entrenamientos si no hay semana anterior completa
    const recentWorkingWeights = validRecords.slice(-5).map(r => r.weight);
    if (recentWorkingWeights.length > 0) {
      avgRecentWorking = recentWorkingWeights.reduce((sum, w) => sum + w, 0) / recentWorkingWeights.length;
      maxRecentWorking = Math.max(...recentWorkingWeights);

      if (process.env.NODE_ENV === 'development') {
        console.log(`[OPCIÓN A] ⚠️ Fallback peso trabajo: ${avgRecentWorking.toFixed(1)}kg (últimos 5 entrenamientos)`);
      }
    }
  }

  // Predicción conservadora de peso de trabajo para próxima semana
  // Máximo incremento realista: 2.5kg/semana para principiantes, menos para avanzados
  const maxWeeklyIncrease = Math.max(0, Math.min(2.5, strengthTrend));

  let nextWeekWeight = Math.max(
    avgRecentWorking, // Nunca menos que el promedio actual
    avgRecentWorking + maxWeeklyIncrease
  );

  // Validación adicional: no más del 105% del peso máximo reciente
  nextWeekWeight = Math.min(nextWeekWeight, maxRecentWorking * 1.05);

  // Validación final: el peso no debe diferir más del 15% del promedio reciente
  const maxReasonableChange = avgRecentWorking * 0.15;
  nextWeekWeight = Math.max(
    avgRecentWorking - maxReasonableChange,
    Math.min(avgRecentWorking + maxReasonableChange, nextWeekWeight)
  );

  // Predicción de volumen con validación más estricta
  const nextWeekVolume = Math.max(
    avgVolume * 0.9, // Mínimo 90% del volumen promedio
    Math.min(
      avgVolume * 1.15, // Máximo 115% del volumen promedio
      avgVolume + Math.max(-20, Math.min(20, volumeTrend)) // Limitar cambio a ±20kg
    )
  );

  return {
    nextWeekWeight: Math.round(nextWeekWeight * 100) / 100,
    nextWeekVolume: Math.round(nextWeekVolume)
  };
};

/**
 * Calcula la predicción de récord personal
 * CORREGIDO: Mejores límites, redondeo y validación
 */
const calculatePRPrediction = (
  current1RMMax: number,
  strengthTrend: number,
  confidenceLevel: number
): { weight: number; confidence: number; timeToNextPR: number } => {
  // Validar entrada
  if (current1RMMax <= 0) {
    return { weight: 0, confidence: 0, timeToNextPR: 0 };
  }

  // Calcular PR predicho con límites más realistas
  const minImprovement = current1RMMax * PROGRESS_CONSTANTS.PR_THRESHOLD_PERCENT; // 2.5%
  const trendBasedImprovement = Math.max(0, strengthTrend * 4); // Solo tendencias positivas

  // Limitar mejora máxima a 15% del 1RM actual (realista)
  const maxRealisticImprovement = current1RMMax * 0.15;

  const predictedPRWeight = current1RMMax + Math.min(
    Math.max(minImprovement, trendBasedImprovement),
    maxRealisticImprovement
  );

  // Tiempo hasta PR más realista
  const prThreshold = current1RMMax + minImprovement;
  let timeToNextPR = 0;

  if (strengthTrend > 0) {
    timeToNextPR = Math.ceil((prThreshold - current1RMMax) / strengthTrend);
    // Limitar a rango realista: entre 1 y 12 semanas
    timeToNextPR = Math.max(1, Math.min(12, timeToNextPR));
  } else {
    // Sin tendencia positiva = tiempo indefinido, pero conservador
    timeToNextPR = 8;
  }

  // Confianza específica para PR con lógica mejorada
  let prConfidence = confidenceLevel;

  // Ajustar por calidad de tendencia
  if (strengthTrend > 1) {
    prConfidence += 15; // Tendencia fuerte = mayor confianza
  } else if (strengthTrend > 0.5) {
    prConfidence += 10; // Tendencia moderada
  } else if (strengthTrend > 0) {
    prConfidence += 5; // Tendencia leve
  } else {
    prConfidence -= 20; // Sin progreso = menor confianza
  }

  // Ajustar por tiempo hasta PR
  if (timeToNextPR <= 2) {
    prConfidence += 5; // PR cercano = más confianza
  } else if (timeToNextPR >= 10) {
    prConfidence -= 10; // PR lejano = menos confianza
  }

  // Ajustar por tamaño de la mejora predicha
  const improvementPercent = ((predictedPRWeight - current1RMMax) / current1RMMax) * 100;
  if (improvementPercent > 10) {
    prConfidence -= 15; // Mejoras muy grandes = menos confianza
  }

  return {
    weight: Math.round(predictedPRWeight * 100) / 100, // Redondeo a 2 decimales
    confidence: Math.max(5, Math.min(95, Math.round(prConfidence))),
    timeToNextPR: timeToNextPR
  };
};

/**
 * Calcula el riesgo de meseta
 */
const calculatePlateauRisk = (
  experienceLevel: 'beginner' | 'intermediate' | 'advanced',
  validRecords: WorkoutRecord[],
  overallProgress: number,
  strengthTrend: number
): number => {
  let plateauRisk = 50;

  if (experienceLevel === 'beginner') {
    plateauRisk = Math.max(10, Math.min(40, 40 - (validRecords.length * 3)));
  } else if (experienceLevel === 'intermediate') {
    plateauRisk = 40;
    if (overallProgress < 0) plateauRisk += 20;
    else if (overallProgress > 10) plateauRisk -= 15;
  } else {
    plateauRisk = 60;
    if (overallProgress < 0) plateauRisk += 15;
    else if (overallProgress > 5) plateauRisk -= 10;
  }

  // Ajustar por tendencia actual
  if (strengthTrend > 0) plateauRisk -= Math.min(20, strengthTrend * 5);
  else if (strengthTrend < 0) plateauRisk += Math.min(20, Math.abs(strengthTrend) * 5);

  return Math.max(10, Math.min(90, plateauRisk));
};

/**
 * Genera recomendaciones adaptativas basadas en el análisis
 */
const generateRecommendations = (
  experienceLevel: 'beginner' | 'intermediate' | 'advanced',
  validRecords: WorkoutRecord[],
  trendAnalysis: 'mejorando' | 'estable' | 'empeorando' | 'insuficiente',
  weeklyDataLength: number,
  plateauRisk: number
): string[] => {
  const recommendations: string[] = [];

  if (experienceLevel === 'beginner') {
    recommendations.push('Como principiante, enfócate en consistencia y técnica correcta');
    if (validRecords.length < 5) {
      recommendations.push('Registra más entrenamientos para mejores predicciones');
    }
    if (trendAnalysis === 'mejorando') {
      recommendations.push('¡Excelente progresión inicial! Mantén la consistencia');
    }
  } else if (experienceLevel === 'intermediate') {
    if (trendAnalysis === 'mejorando') {
      recommendations.push('Progreso sólido - mantén tu rutina actual');
    } else if (trendAnalysis === 'empeorando') {
      recommendations.push('Revisa descanso, técnica y variedad de ejercicios');
    } else {
      recommendations.push('Introduce nuevos estímulos para romper el estancamiento');
    }
    if (weeklyDataLength < 4) {
      recommendations.push('Más datos semanales mejorarán las predicciones');
    }
  } else {
    if (trendAnalysis === 'mejorando') {
      recommendations.push('Excelente progresión - considera periodización avanzada');
    } else if (trendAnalysis === 'empeorando') {
      recommendations.push('Evalúa factores: descanso, nutrición, estrés, sobreentrenamiento');
    } else {
      recommendations.push('Considera cambios en metodología o periodización');
    }
  }

  if (plateauRisk > 70) {
    recommendations.push('Alto riesgo de meseta - varía ejercicios o metodología');
  }

  return recommendations.slice(0, 5);
};

/**
 * Valida y corrige predicciones para asegurar coherencia
 */
const validateAndCorrectPredictions = (
  prediction: ProgressPrediction,
  basicMetrics: ReturnType<typeof calculateBasicMetrics>,
  validRecords: WorkoutRecord[]
): ProgressPrediction => {
  const correctedPrediction = { ...prediction };

  // 1. CORREGIDO: Validar peso de trabajo próxima semana vs datos reales
  // El peso próxima semana debe ser peso de trabajo realista, no % del 1RM
  const recentWorkingWeights = validRecords.slice(-5).map(r => r.weight);
  const avgRecentWorking = recentWorkingWeights.reduce((sum, w) => sum + w, 0) / recentWorkingWeights.length;
  const maxRecentWorking = Math.max(...recentWorkingWeights);

  // Límites realistas para peso de trabajo: entre 95% y 105% del peso actual
  const minReasonableNextWeekWeight = avgRecentWorking * 0.95;
  const maxReasonableNextWeekWeight = Math.min(maxRecentWorking * 1.05, avgRecentWorking * 1.10);

  if (correctedPrediction.nextWeekWeight < minReasonableNextWeekWeight) {
    correctedPrediction.nextWeekWeight = Math.round(minReasonableNextWeekWeight * 100) / 100;
  } else if (correctedPrediction.nextWeekWeight > maxReasonableNextWeekWeight) {
    correctedPrediction.nextWeekWeight = Math.round(maxReasonableNextWeekWeight * 100) / 100;
  }

  // 2. Validar que el PR no sea excesivamente mayor al 1RM actual
  const current1RM = basicMetrics.current1RMMax;
  const maxReasonablePRIncrease = current1RM * 1.15; // Máximo 15% de mejora
  if (correctedPrediction.predictedPR.weight > maxReasonablePRIncrease) {
    correctedPrediction.predictedPR.weight = Math.round(maxReasonablePRIncrease * 100) / 100;
    // Reducir confianza si tuvimos que corregir
    correctedPrediction.predictedPR.confidence = Math.max(5, correctedPrediction.predictedPR.confidence - 20);
  }

  // 3. Validar volumen próxima semana vs tendencia
  const avgRecentVolume = validRecords.slice(-5).reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0) / Math.min(5, validRecords.length);
  const minReasonableNextWeekVolume = avgRecentVolume * 0.85; // Máximo 15% de caída
  const maxReasonableNextWeekVolume = avgRecentVolume * 1.15; // Máximo 15% de aumento

  if (correctedPrediction.nextWeekVolume < minReasonableNextWeekVolume) {
    correctedPrediction.nextWeekVolume = Math.round(minReasonableNextWeekVolume);
  } else if (correctedPrediction.nextWeekVolume > maxReasonableNextWeekVolume) {
    correctedPrediction.nextWeekVolume = Math.round(maxReasonableNextWeekVolume);
  }

  // CORRECCIÓN: Tendencias de volumen más estrictas y realistas
  if (Math.abs(correctedPrediction.volumeTrend) > 20) {
    // Tendencias de volumen realistas: máximo ±20kg/semana
    correctedPrediction.volumeTrend = Math.max(-20, Math.min(20, correctedPrediction.volumeTrend));
    // Recalcular volumen próxima semana basado en tendencia corregida
    correctedPrediction.nextWeekVolume = Math.round(avgRecentVolume + correctedPrediction.volumeTrend);
  }

  // 4. Validar tendencias vs crecimiento mensual
  const impliedMonthlyFromStrength = correctedPrediction.strengthTrend * 4.345; // Semanas por mes exactas
  if (Math.abs(correctedPrediction.monthlyGrowthRate - impliedMonthlyFromStrength) > 2) {
    // Si hay discrepancia > 2kg, usar el valor más conservador
    correctedPrediction.monthlyGrowthRate = Math.sign(correctedPrediction.monthlyGrowthRate) *
      Math.min(Math.abs(correctedPrediction.monthlyGrowthRate), Math.abs(impliedMonthlyFromStrength));
  }

  // 5. Ajustar confianza basado en las correcciones realizadas
  let confidencePenalty = 0;
  const corrections: string[] = [];

  if (prediction.nextWeekWeight !== correctedPrediction.nextWeekWeight) {
    confidencePenalty += 10;
    corrections.push(`Peso próxima semana: ${prediction.nextWeekWeight}kg → ${correctedPrediction.nextWeekWeight}kg`);
  }
  if (prediction.predictedPR.weight !== correctedPrediction.predictedPR.weight) {
    confidencePenalty += 15;
    corrections.push(`PR predicho: ${prediction.predictedPR.weight}kg → ${correctedPrediction.predictedPR.weight}kg`);
  }
  if (prediction.nextWeekVolume !== correctedPrediction.nextWeekVolume) {
    confidencePenalty += 5;
    corrections.push(`Volumen próxima semana: ${prediction.nextWeekVolume}kg → ${correctedPrediction.nextWeekVolume}kg`);
  }
  if (Math.abs(correctedPrediction.volumeTrend - prediction.volumeTrend) > 1) {
    corrections.push(`Tendencia volumen: ${prediction.volumeTrend}kg/sem → ${correctedPrediction.volumeTrend}kg/sem`);
  }

  // Solo en desarrollo - mostrar correcciones realizadas
  if (corrections.length > 0 && process.env.NODE_ENV === 'development') {
    console.warn(`[Predicciones] ${corrections.length} correcciones aplicadas:`, corrections);
  }

  if (confidencePenalty > 0) {
    correctedPrediction.confidenceLevel = Math.max(5, correctedPrediction.confidenceLevel - confidencePenalty);
    correctedPrediction.predictedPR.confidence = Math.max(5, correctedPrediction.predictedPR.confidence - confidencePenalty);
  }

  // 6. Validar tiempo hasta PR vs tendencia
  if (correctedPrediction.strengthTrend > 0) {
    const impliedTimeToNextPR = ((correctedPrediction.predictedPR.weight - current1RM) / correctedPrediction.strengthTrend);
    if (Math.abs(correctedPrediction.timeToNextPR - impliedTimeToNextPR) > 4) {
      correctedPrediction.timeToNextPR = Math.max(1, Math.min(12, Math.round(impliedTimeToNextPR)));
    }
  }

  // 7. VALIDACIONES FINALES ESTRICTAS: Asegurar rangos absolutamente realistas

  // Peso próxima semana: debe estar en rango razonable para cualquier usuario
  correctedPrediction.nextWeekWeight = Math.max(10, Math.min(300, correctedPrediction.nextWeekWeight));

  // Volumen próxima semana: debe estar en rango humano razonable
  correctedPrediction.nextWeekVolume = Math.max(100, Math.min(50000, correctedPrediction.nextWeekVolume));

  // PR predicho: no puede ser más de 2x el peso actual máximo
  const maxReasonablePR = Math.max(...recentWorkingWeights) * 2;
  correctedPrediction.predictedPR.weight = Math.min(correctedPrediction.predictedPR.weight, maxReasonablePR);

  // Tendencias: rangos absolutamente máximos
  correctedPrediction.strengthTrend = Math.max(-10, Math.min(10, correctedPrediction.strengthTrend));
  correctedPrediction.volumeTrend = Math.max(-100, Math.min(100, correctedPrediction.volumeTrend));

  // Crecimiento mensual: máximo realista
  correctedPrediction.monthlyGrowthRate = Math.max(-10, Math.min(20, correctedPrediction.monthlyGrowthRate));

  // Riesgo meseta: debe estar entre 0-100%
  correctedPrediction.plateauRisk = Math.max(0, Math.min(100, correctedPrediction.plateauRisk));

  // Confianza: debe estar entre 5-95%
  correctedPrediction.confidenceLevel = Math.max(5, Math.min(95, correctedPrediction.confidenceLevel));
  correctedPrediction.predictedPR.confidence = Math.max(5, Math.min(95, correctedPrediction.predictedPR.confidence));

  // Tiempo hasta PR: entre 1-52 semanas
  correctedPrediction.timeToNextPR = Math.max(1, Math.min(52, correctedPrediction.timeToNextPR));

  return correctedPrediction;
};

/**
 * Función principal refactorizada para predicciones de progreso
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
  const overallProgressData = calculateOverallProgress(validation.validRecords, validation.daysBetween);

  // Calcular tendencias usando la función auxiliar
  const trendsData = calculateTrends(
    validation.validRecords,
    validation.experienceLevel,
    overallProgressData.overallProgress,
    basicMetrics.avgVolume,
    basicMetrics.avgWeight,
    validation.daysBetween
  );

  // Determinar análisis de tendencia
  const trendAnalysis = determineTrendAnalysis(
    validation.validRecords,
    trendsData.strengthTrend,
    trendsData.volumeTrend,
    basicMetrics.avgWeight,
    basicMetrics.avgVolume
  );

  // Calcular nivel de confianza
  const confidenceLevel = calculateConfidenceLevel(
    validation.experienceLevel,
    validation.validRecords,
    trendsData.weeklyDataLength,
    basicMetrics.avgWeight
  );

  // Calcular predicciones para próxima semana
  const nextWeekPredictions = calculateNextWeekPredictions(
    validation.validRecords,
    trendsData.strengthTrend,
    trendsData.volumeTrend,
    basicMetrics.avgVolume,
    basicMetrics.current1RMMax
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
    validation.experienceLevel,
    validation.validRecords,
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
  const validatedResult = validateAndCorrectPredictions(result, basicMetrics, validation.validRecords);

  return validatedResult;
};

// Funciones auxiliares para la función unificada
const groupRecordsByWeek = (records: WorkoutRecord[]): { volume: number; weight: number; date: Date }[] => {
  const weekGroups = new Map<string, WorkoutRecord[]>();

  records.forEach(record => {
    const date = new Date(record.date);
    // CORRECCIÓN: Usar date-fns con locale español (consistente con el resto del código)
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

  // Indicadores de rendimiento pico mejorados
  const peakPerformanceIndicators = generateEnhancedPerformanceIndicators(records);

  // Sugerencias de optimización consolidadas y priorizadas
  const optimizationSuggestions: string[] = [];
  const efficiency = analyzeTrainingEfficiency(records);
  const prediction = predictProgress(records);

  // 1. Añadir sugerencias avanzadas (las más específicas y útiles)
  const advancedSuggestions = generateAdvancedOptimizationSuggestions(records);
  optimizationSuggestions.push(...advancedSuggestions.slice(0, 4)); // Máximo 4 sugerencias avanzadas

  // 2. Prioridad ALTA: Problemas críticos
  if (fatigueAnalysis.fatigueIndex > 70) {
    optimizationSuggestions.push('CRÍTICO: Descanso inmediato necesario - riesgo de lesión o sobreentrenamiento');
  }

  if (prediction.plateauRisk > 80) {
    optimizationSuggestions.push('CRÍTICO: Riesgo muy alto de meseta - cambiar rutina inmediatamente');
  }

  // 3. Prioridad MEDIA: Mejoras importantes
  if (intensityMetrics.overallIntensity === 'Baja') {
    optimizationSuggestions.push('Aumentar intensidad general - peso, volumen o frecuencia');
  } else if (intensityMetrics.overallIntensity === 'Excesiva') {
    optimizationSuggestions.push('Reducir intensidad - implementar semana de descarga');
  }

  if (prediction.trendAnalysis === 'empeorando') {
    optimizationSuggestions.push('Tendencia negativa detectada - revisar descanso, nutrición y técnica');
  }

  // 4. Prioridad BAJA: Optimizaciones menores
  if (efficiency.timeEfficiencyScore < 40) {
    optimizationSuggestions.push('Optimizar eficiencia temporal - aumentar volumen por sesión');
  }

  // 5. Recomendaciones específicas de recuperación (si aplicables)
  if (fatigueAnalysis.restRecommendation !== 'Continuar rutina normal' && fatigueAnalysis.fatigueIndex <= 70) {
    optimizationSuggestions.push(fatigueAnalysis.restRecommendation);
  }

  // 6. Si no hay sugerencias críticas, añadir feedback positivo
  if (optimizationSuggestions.length === 0) {
    optimizationSuggestions.push('Tu entrenamiento está bien optimizado - mantén la consistencia');
  }

  return {
    trainingDensity,
    trainingEfficiency: efficiency,
    fatigueAnalysis,
    periodComparisons: comparePeriods(records),
    progressPrediction: prediction,
    intensityMetrics,
    peakPerformanceIndicators,
    optimizationSuggestions: Array.from(new Set(optimizationSuggestions)).slice(0, 6) // Eliminar duplicados y limitar a 6
  };
};

/**
 * Genera sugerencias de optimización avanzadas basadas en análisis de datos
 */
export const generateAdvancedOptimizationSuggestions = (records: WorkoutRecord[]): string[] => {
  if (records.length === 0) return [];

  // **VALIDACIÓN DE DATOS TEMPORALES**
  const sortedRecords = [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const firstDate = new Date(sortedRecords[0].date);
  const lastDate = new Date(sortedRecords[sortedRecords.length - 1].date);
  const totalDays = Math.ceil((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));

  // Validación silenciosa de rango temporal

  // Si hay menos de 2 semanas de datos, dar sugerencias básicas
  if (totalDays < 14) {
    return [
      'Sigue entrenando de forma consistente durante al menos 2 semanas para recibir análisis detallados',
      'Registra todos tus entrenamientos para obtener métricas más precisas',
      'Mantén un patrón de entrenamiento regular para mejorar el análisis temporal'
    ];
  }

  const suggestions: string[] = [];

  // 1. ANÁLISIS DE DESEQUILIBRIOS MUSCULARES
  const categoryAnalysis = analyzeMuscleGroupBalance(records);

  // Detectar desequilibrios significativos
  const categories = Object.keys(categoryAnalysis);
  const categoryVolumes = categories.map(cat => categoryAnalysis[cat]);
  const maxVolume = Math.max(...categoryVolumes);
  const minVolume = Math.min(...categoryVolumes);

  if (maxVolume > 0 && minVolume / maxVolume < 0.3) {
    const dominantCategory = categories[categoryVolumes.indexOf(maxVolume)];
    const weakCategory = categories[categoryVolumes.indexOf(minVolume)];
    suggestions.push(`Desequilibrio detectado: ${dominantCategory} domina sobre ${weakCategory}. Aumenta volumen de ${weakCategory} 40-60%`);
  }

  // 2. ANÁLISIS DE PATRONES TEMPORALES
  const dailyPatterns = analyzeDailyTrainingPatterns(records);

  const activeDays = Object.values(dailyPatterns).filter(count => count > 0).length;
  if (activeDays <= 2) {
    suggestions.push(`Distribución subóptima: Solo entrenas ${activeDays} días/semana. Considera 3-4 días distribuidos para mejor recuperación`);
  }

  // 3. ANÁLISIS DE PROGRESIÓN PERSONALIZADA
  const experienceLevel = determineExperienceLevel(records);
  const progressionRate = calculateProgressionRate(records);

  if (experienceLevel === 'beginner' && progressionRate < 2) {
    suggestions.push('Como principiante, deberías progresar más rápido. Aumenta peso 5-10% cada semana en ejercicios básicos');
  } else if (experienceLevel === 'intermediate' && progressionRate < 0.5) {
    suggestions.push('Progresión lenta para nivel intermedio. Implementa periodización: 3 semanas progresivas + 1 descarga');
  } else if (experienceLevel === 'advanced' && progressionRate < 0.2) {
    suggestions.push('Progresión avanzada requiere variación. Alterna fases de fuerza (3-5 reps) y hipertrofia (8-12 reps)');
  }

  // 4. ANÁLISIS DE VARIACIÓN Y PERIODIZACIÓN
  const recentExercises = records.slice(-14); // Últimas 2 semanas
  const uniqueExercises = new Set(recentExercises.map(r => r.exercise)).size;

  if (uniqueExercises < 6) {
    suggestions.push(`Baja variedad: Solo ${uniqueExercises} ejercicios diferentes. Añade 2-3 ejercicios nuevos para estimular adaptación`);
  }

  // 5. ANÁLISIS DE INTENSIDAD POR RANGOS DE REPETICIONES
  const repRangeAnalysis = analyzeRepRanges(records);
  const lowRepPercent = repRangeAnalysis.lowRep / (repRangeAnalysis.total || 1) * 100;
  const highRepPercent = repRangeAnalysis.highRep / (repRangeAnalysis.total || 1) * 100;

  if (lowRepPercent > 70) {
    suggestions.push('Dominio de bajas repeticiones (fuerza). Incluye rangos 8-12 reps para hipertrofia y resistencia');
  } else if (highRepPercent > 70) {
    suggestions.push('Dominio de altas repeticiones. Incluye rangos 3-6 reps para desarrollar fuerza máxima');
  }

  // 6. ANÁLISIS DE CONSISTENCIA TEMPORAL
  const consistencyAnalysis = analyzeTemporalConsistency(records);
  if (consistencyAnalysis.weeklyVariation > 50) {
    suggestions.push('Inconsistencia semanal alta. Establece horarios fijos de entrenamiento para mejorar adaptación');
  }

  // 7. ANÁLISIS DE SOBRECARGA PROGRESIVA
  const overloadAnalysis = analyzeProgressiveOverload(records);
  if (overloadAnalysis.stagnantWeeks > 3) {
    suggestions.push(`${overloadAnalysis.stagnantWeeks} semanas sin progresión. Cambia variables: peso, repeticiones, series o tempo`);
  }

  // 8. ANÁLISIS DE RECUPERACIÓN ENTRE SESIONES
  const recoveryAnalysis = analyzeRecoveryPatterns(records);
  if (recoveryAnalysis.averageRestDays < 1) {
    suggestions.push('Entrenamientos muy frecuentes. Incluye al menos 1 día de descanso entre sesiones intensas');
  } else if (recoveryAnalysis.averageRestDays > 3) {
    suggestions.push('Períodos de descanso muy largos. Reduce a 1-2 días para mantener adaptaciones');
  }

  // 9. ANÁLISIS DE VOLUMEN ÓPTIMO
  const volumeAnalysis = analyzeOptimalVolume(records);
  if (volumeAnalysis.weeklyVolume < volumeAnalysis.minimumEffective) {
    suggestions.push(`Volumen insuficiente: ${Math.round(volumeAnalysis.weeklyVolume)}kg/semana. Aumenta a ${Math.round(volumeAnalysis.minimumEffective)}kg mínimo`);
  } else if (volumeAnalysis.weeklyVolume > volumeAnalysis.maximumRecoverable) {
    suggestions.push(`Volumen excesivo: ${Math.round(volumeAnalysis.weeklyVolume)}kg/semana. Reduce a ${Math.round(volumeAnalysis.maximumRecoverable)}kg máximo`);
  }

  // 10. ANÁLISIS DE TÉCNICA Y SEGURIDAD
  const safetyAnalysis = analyzeSafetyPatterns(records);
  if (safetyAnalysis.rapidWeightIncrease > 15) {
    suggestions.push(`Incremento muy rápido (${safetyAnalysis.rapidWeightIncrease}% en 2 semanas). Reduce progresión a 2-5% semanal`);
  }

  // 11. ANÁLISIS DE ESPECIFICIDAD POR OBJETIVOS
  const goalSpecificAnalysis = analyzeGoalSpecificity(records);
  if (goalSpecificAnalysis.strengthFocus < 30 && goalSpecificAnalysis.hypertrophyFocus < 30) {
    suggestions.push('Falta especificidad. Define objetivo: fuerza (3-5 reps, 85-95% 1RM) o hipertrofia (6-12 reps, 70-85% 1RM)');
  }

  // 12. ANÁLISIS DE METABOLISMO Y ENERGÍA
  const energyAnalysis = analyzeEnergyDemands(records);
  if (energyAnalysis.sessionDuration > 90) {
    suggestions.push(`Sesiones muy largas (${energyAnalysis.sessionDuration}min promedio). Reduce a 45-75min para mantener intensidad`);
  }

  return suggestions.slice(0, 10); // Limitar a 10 sugerencias más relevantes
};

// Funciones auxiliares para análisis específicos
const analyzeMuscleGroupBalance = (records: WorkoutRecord[]) => {
  // Análisis de balance muscular basado en categorías
  const categories = ['pecho', 'espalda', 'piernas', 'hombros', 'brazos', 'core'];
  const categoryVolumes: Record<string, number> = {};

  categories.forEach(cat => {
    categoryVolumes[cat] = records
      .filter(r => r.exercise?.name.toLowerCase().includes(cat.toLowerCase()) || false)
      .reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0);
  });

  return categoryVolumes;
};

const analyzeDailyTrainingPatterns = (records: WorkoutRecord[]) => {
  const dailyPatterns: Record<string, number> = {};
  const dayNames = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

  dayNames.forEach(day => dailyPatterns[day] = 0);

  records.forEach(record => {
    const dayName = dayNames[record.date.getDay()];
    dailyPatterns[dayName]++;
  });

  return dailyPatterns;
};

// Función eliminada - ahora se usa la nueva función exportada determineExperienceLevel

const calculateProgressionRate = (records: WorkoutRecord[]): number => {
  if (records.length < 4) return 0;

  const sortedRecords = [...records].sort((a, b) => a.date.getTime() - b.date.getTime());
  const firstQuarter = sortedRecords.slice(0, Math.floor(sortedRecords.length / 4));
  const lastQuarter = sortedRecords.slice(-Math.floor(sortedRecords.length / 4));

  const firstAvg = firstQuarter.reduce((sum, r) => sum + r.weight, 0) / firstQuarter.length;
  const lastAvg = lastQuarter.reduce((sum, r) => sum + r.weight, 0) / lastQuarter.length;

  return firstAvg > 0 ? ((lastAvg - firstAvg) / firstAvg) * 100 : 0;
};

const analyzeExerciseVariety = (records: WorkoutRecord[]) => {
  const exercises = new Set(records.map(r => r.exercise));
  const recentExercises = new Set(records.slice(-14).map(r => r.exercise));

  return {
    total: exercises.size,
    recent: recentExercises.size,
    varietyScore: (recentExercises.size / Math.max(exercises.size, 1)) * 100
  };
};

const analyzeRepRanges = (records: WorkoutRecord[]) => {
  let lowRep = 0; // 1-5 reps
  let midRep = 0; // 6-12 reps
  let highRep = 0; // 13+ reps

  records.forEach(record => {
    if (record.reps <= 5) lowRep++;
    else if (record.reps <= 12) midRep++;
    else highRep++;
  });

  return { lowRep, midRep, highRep, total: records.length };
};

const analyzeTemporalConsistency = (records: WorkoutRecord[]) => {
  const weeklyVolumes: number[] = [];
  const weeksData = groupRecordsByWeeks(records);

  weeksData.forEach(week => {
    const volume = week.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0);
    weeklyVolumes.push(volume);
  });

  const avgVolume = weeklyVolumes.reduce((sum, v) => sum + v, 0) / weeklyVolumes.length;
  const variance = weeklyVolumes.reduce((sum, v) => sum + Math.pow(v - avgVolume, 2), 0) / weeklyVolumes.length;

  return { weeklyVariation: (Math.sqrt(variance) / avgVolume) * 100 };
};

const analyzeProgressiveOverload = (records: WorkoutRecord[]) => {
  const exerciseProgression: Record<string, number[]> = {};

  records.forEach(record => {
    const exerciseName = record.exercise?.name || 'Sin nombre';
    if (!exerciseProgression[exerciseName]) {
      exerciseProgression[exerciseName] = [];
    }
    exerciseProgression[exerciseName].push(record.weight);
  });

  let stagnantWeeks = 0;
  Object.values(exerciseProgression).forEach(weights => {
    if (weights.length >= 3) {
      const lastThree = weights.slice(-3);
      if (lastThree.every(w => w === lastThree[0])) {
        stagnantWeeks++;
      }
    }
  });

  return { stagnantWeeks };
};

const analyzeRecoveryPatterns = (records: WorkoutRecord[]) => {
  const sortedRecords = [...records].sort((a, b) => a.date.getTime() - b.date.getTime());
  let totalRestDays = 0;
  let restPeriods = 0;

  for (let i = 1; i < sortedRecords.length; i++) {
    const daysDiff = Math.floor((sortedRecords[i].date.getTime() - sortedRecords[i - 1].date.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff > 0) {
      totalRestDays += daysDiff;
      restPeriods++;
    }
  }

  return { averageRestDays: restPeriods > 0 ? totalRestDays / restPeriods : 1 };
};

const analyzeOptimalVolume = (records: WorkoutRecord[]) => {
  const weeklyVolumes = calculateWeeklyVolumes(records);
  const avgWeeklyVolume = weeklyVolumes.reduce((sum, v) => sum + v, 0) / weeklyVolumes.length;

  // Basado en research: 10-20 series por grupo muscular por semana
  const estimatedMinimum = avgWeeklyVolume * 0.7;
  const estimatedMaximum = avgWeeklyVolume * 1.5;

  return {
    weeklyVolume: avgWeeklyVolume,
    minimumEffective: estimatedMinimum,
    maximumRecoverable: estimatedMaximum
  };
};

const analyzeSafetyPatterns = (records: WorkoutRecord[]) => {
  const recentRecords = records.slice(-14); // Últimas 2 semanas
  const earlierRecords = records.slice(-28, -14); // 2 semanas anteriores

  const recentAvgWeight = recentRecords.reduce((sum, r) => sum + r.weight, 0) / recentRecords.length;
  const earlierAvgWeight = earlierRecords.reduce((sum, r) => sum + r.weight, 0) / earlierRecords.length;

  const weightIncrease = earlierAvgWeight > 0 ? ((recentAvgWeight - earlierAvgWeight) / earlierAvgWeight) * 100 : 0;

  return { rapidWeightIncrease: weightIncrease };
};

const analyzeGoalSpecificity = (records: WorkoutRecord[]) => {
  let strengthFocus = 0; // 1-5 reps
  let hypertrophyFocus = 0; // 6-12 reps
  let enduranceFocus = 0; // 13+ reps

  records.forEach(record => {
    if (record.reps <= 5) strengthFocus++;
    else if (record.reps <= 12) hypertrophyFocus++;
    else enduranceFocus++;
  });

  const total = records.length;
  return {
    strengthFocus: (strengthFocus / total) * 100,
    hypertrophyFocus: (hypertrophyFocus / total) * 100,
    enduranceFocus: (enduranceFocus / total) * 100
  };
};

const analyzeEnergyDemands = (records: WorkoutRecord[]) => {
  // Estimación de duración de sesión basada en volumen
  const sessionVolumes = groupRecordsBySession(records);
  const avgSessionVolume = sessionVolumes.reduce((sum, v) => sum + v, 0) / sessionVolumes.length;

  // Estimación: 1 serie = 2-3 minutos incluyendo descanso
  const estimatedDuration = (avgSessionVolume / 100) * 2.5; // Aproximación

  return { sessionDuration: estimatedDuration };
};

// Funciones auxiliares para agrupación
const groupRecordsByWeeks = (records: WorkoutRecord[]): WorkoutRecord[][] => {
  const weeks: WorkoutRecord[][] = [];
  const sortedRecords = [...records].sort((a, b) => a.date.getTime() - b.date.getTime());

  let currentWeek: WorkoutRecord[] = [];
  let currentWeekStart: Date | null = null;

  sortedRecords.forEach(record => {
    if (!currentWeekStart || record.date.getTime() - currentWeekStart.getTime() > 7 * 24 * 60 * 60 * 1000) {
      if (currentWeek.length > 0) {
        weeks.push(currentWeek);
      }
      currentWeek = [record];
      currentWeekStart = record.date;
    } else {
      currentWeek.push(record);
    }
  });

  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  return weeks;
};

const calculateWeeklyVolumes = (records: WorkoutRecord[]): number[] => {
  const weeks = groupRecordsByWeeks(records);
  return weeks.map(week => week.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0));
};

const groupRecordsBySession = (records: WorkoutRecord[]): number[] => {
  const sessionVolumes: number[] = [];
  const sessionsByDate: Record<string, WorkoutRecord[]> = {};

  records.forEach(record => {
    const dateKey = record.date.toDateString();
    if (!sessionsByDate[dateKey]) {
      sessionsByDate[dateKey] = [];
    }
    sessionsByDate[dateKey].push(record);
  });

  Object.values(sessionsByDate).forEach(session => {
    const volume = session.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0);
    sessionVolumes.push(volume);
  });

  return sessionVolumes;
};

/**
 * Genera indicadores de rendimiento avanzados con información detallada
 */
export const generateEnhancedPerformanceIndicators = (records: WorkoutRecord[]): Array<{
  type: 'excellent' | 'good' | 'warning' | 'critical';
  icon: string; // Nombre del icono para usar en el componente
  title: string;
  description: string;
  value?: string;
  progress?: number;
  category: 'consistency' | 'progress' | 'intensity' | 'recovery' | 'volume' | 'prediction' | 'plateau' | 'safety';
}> => {
  if (records.length === 0) return [];

  const indicators: Array<{
    type: 'excellent' | 'good' | 'warning' | 'critical';
    icon: string;
    title: string;
    description: string;
    value?: string;
    progress?: number;
    category: 'consistency' | 'progress' | 'intensity' | 'recovery' | 'volume' | 'prediction' | 'plateau' | 'safety';
  }> = [];

  // Análisis de datos básicos
  const thisWeekRecords = getThisWeekRecords(records);
  const lastWeekRecords = getLastWeekRecords(records);
  const weeklyFrequency = new Set(thisWeekRecords.map(r => r.date.toDateString())).size;
  const lastWeekFrequency = new Set(lastWeekRecords.map(r => r.date.toDateString())).size;

  const intensityMetrics = analyzeIntensityMetrics(records);
  const fatigueAnalysis = analyzeFatigue(records);
  const prediction = predictProgress(records);
  const periodComparisons = comparePeriods(records);

  // 1. INDICADOR DE CONSISTENCIA (siempre mostrar)
  if (weeklyFrequency >= 5) {
    indicators.push({
      type: 'excellent',
      icon: 'Calendar',
      title: 'Consistencia Extraordinaria',
      description: `${weeklyFrequency} entrenamientos esta semana - disciplina excepcional`,
      value: `${weeklyFrequency}/7 días`,
      progress: Math.min(100, (weeklyFrequency / 5) * 100),
      category: 'consistency'
    });
  } else if (weeklyFrequency >= 4) {
    indicators.push({
      type: 'excellent',
      icon: 'Calendar',
      title: 'Consistencia Excelente',
      description: `${weeklyFrequency} entrenamientos esta semana - rutina muy sólida`,
      value: `${weeklyFrequency}/7 días`,
      progress: (weeklyFrequency / 5) * 100,
      category: 'consistency'
    });
  } else if (weeklyFrequency >= 3) {
    indicators.push({
      type: 'good',
      icon: 'Calendar',
      title: 'Buena Consistencia',
      description: `${weeklyFrequency} entrenamientos esta semana - mantén el ritmo`,
      value: `${weeklyFrequency}/7 días`,
      progress: (weeklyFrequency / 5) * 100,
      category: 'consistency'
    });
  } else if (weeklyFrequency >= 2) {
    indicators.push({
      type: 'warning',
      icon: 'Calendar',
      title: 'Consistencia Moderada',
      description: `${weeklyFrequency} entrenamientos esta semana - puedes mejorar`,
      value: `${weeklyFrequency}/7 días`,
      progress: (weeklyFrequency / 5) * 100,
      category: 'consistency'
    });
  } else if (weeklyFrequency >= 1) {
    indicators.push({
      type: 'critical',
      icon: 'Calendar',
      title: 'Consistencia Baja',
      description: `Solo ${weeklyFrequency} entrenamiento esta semana - necesitas más frecuencia`,
      value: `${weeklyFrequency}/7 días`,
      progress: (weeklyFrequency / 5) * 100,
      category: 'consistency'
    });
  } else {
    indicators.push({
      type: 'critical',
      icon: 'Calendar',
      title: 'Sin Entrenamientos',
      description: 'No has entrenado esta semana - ¡es hora de retomar!',
      value: '0/7 días',
      progress: 0,
      category: 'consistency'
    });
  }

  // 2. INDICADOR DE TENDENCIA DE FRECUENCIA
  if (weeklyFrequency > lastWeekFrequency && lastWeekFrequency > 0) {
    const improvement = weeklyFrequency - lastWeekFrequency;
    indicators.push({
      type: 'excellent',
      icon: 'TrendingUp',
      title: 'Frecuencia en Ascenso',
      description: `+${improvement} entrenamientos vs semana pasada - ¡excelente progresión!`,
      value: `+${improvement}`,
      progress: Math.min(100, (improvement / 3) * 100),
      category: 'consistency'
    });
  } else if (weeklyFrequency < lastWeekFrequency && lastWeekFrequency > 0) {
    const decline = lastWeekFrequency - weeklyFrequency;
    indicators.push({
      type: 'warning',
      icon: 'TrendingDown',
      title: 'Frecuencia en Descenso',
      description: `-${decline} entrenamientos vs semana pasada - mantén la motivación`,
      value: `-${decline}`,
      progress: Math.max(0, 100 - (decline / 3) * 100),
      category: 'consistency'
    });
  }

  // 3. INDICADOR DE PROGRESO MENSUAL
  const recentComparison = periodComparisons.find(p => p.periodName === 'Último mes');
  if (recentComparison) {
    if (recentComparison.improvement > 15) {
      indicators.push({
        type: 'excellent',
        icon: 'Award',
        title: 'Progreso Sobresaliente',
        description: `${recentComparison.improvement}% mejora - ¡rendimiento excepcional!`,
        value: `+${recentComparison.improvement}%`,
        progress: Math.min(100, recentComparison.improvement * 2),
        category: 'progress'
      });
    } else if (recentComparison.improvement > 10) {
      indicators.push({
        type: 'excellent',
        icon: 'TrendingUp',
        title: 'Progreso Destacado',
        description: `${recentComparison.improvement}% mejora en rendimiento general`,
        value: `+${recentComparison.improvement}%`,
        progress: Math.min(100, recentComparison.improvement * 3),
        category: 'progress'
      });
    } else if (recentComparison.improvement > 5) {
      indicators.push({
        type: 'good',
        icon: 'TrendingUp',
        title: 'Progreso Constante',
        description: `${recentComparison.improvement}% mejora mantenida`,
        value: `+${recentComparison.improvement}%`,
        progress: Math.min(100, recentComparison.improvement * 5),
        category: 'progress'
      });
    } else if (recentComparison.improvement > 0) {
      indicators.push({
        type: 'good',
        icon: 'TrendingUp',
        title: 'Progreso Leve',
        description: `${recentComparison.improvement}% mejora - sigue así`,
        value: `+${recentComparison.improvement}%`,
        progress: Math.min(100, recentComparison.improvement * 10),
        category: 'progress'
      });
    } else if (recentComparison.improvement > -5) {
      indicators.push({
        type: 'warning',
        icon: 'Target',
        title: 'Progreso Estancado',
        description: `${Math.abs(recentComparison.improvement)}% cambio - considera variar rutina`,
        value: `${recentComparison.improvement}%`,
        progress: 50,
        category: 'progress'
      });
    } else {
      indicators.push({
        type: 'critical',
        icon: 'AlertTriangle',
        title: 'Declive en Progreso',
        description: `${recentComparison.improvement}% decline - revisa estrategia`,
        value: `${recentComparison.improvement}%`,
        progress: Math.max(0, 50 + recentComparison.improvement * 2),
        category: 'progress'
      });
    }
  }

  // 4. INDICADOR DE INTENSIDAD
  const intensityScore = (intensityMetrics.averageIntensity + intensityMetrics.volumeIntensity + intensityMetrics.frequencyIntensity) / 3;

  if (intensityMetrics.overallIntensity === 'Óptima') {
    indicators.push({
      type: 'excellent',
      icon: 'Zap',
      title: 'Intensidad Perfecta',
      description: 'Balance ideal entre volumen, peso y frecuencia',
      value: `${Math.round(intensityScore)}%`,
      progress: intensityScore,
      category: 'intensity'
    });
  } else if (intensityMetrics.overallIntensity === 'Alta') {
    indicators.push({
      type: 'good',
      icon: 'Zap',
      title: 'Alta Intensidad',
      description: 'Entrenamiento intenso, monitorea la recuperación',
      value: `${Math.round(intensityScore)}%`,
      progress: intensityScore,
      category: 'intensity'
    });
  } else if (intensityMetrics.overallIntensity === 'Baja') {
    indicators.push({
      type: 'warning',
      icon: 'Zap',
      title: 'Intensidad Baja',
      description: 'Considera aumentar peso, volumen o frecuencia',
      value: `${Math.round(intensityScore)}%`,
      progress: intensityScore,
      category: 'intensity'
    });
  } else if (intensityMetrics.overallIntensity === 'Excesiva') {
    indicators.push({
      type: 'critical',
      icon: 'AlertTriangle',
      title: 'Intensidad Excesiva',
      description: 'Riesgo alto - considera semana de descarga',
      value: `${Math.round(intensityScore)}%`,
      progress: intensityScore,
      category: 'intensity'
    });
  }

  // 5. INDICADOR DE RECUPERACIÓN
  if (fatigueAnalysis.overreachingRisk === 'Bajo' && fatigueAnalysis.fatigueIndex <= 30) {
    indicators.push({
      type: 'excellent',
      icon: 'Shield',
      title: 'Recuperación Óptima',
      description: 'Estado ideal - bajo riesgo de sobreentrenamiento',
      value: `${100 - fatigueAnalysis.fatigueIndex}%`,
      progress: 100 - fatigueAnalysis.fatigueIndex,
      category: 'recovery'
    });
  } else if (fatigueAnalysis.overreachingRisk === 'Bajo') {
    indicators.push({
      type: 'good',
      icon: 'Shield',
      title: 'Recuperación Adecuada',
      description: 'Bajo riesgo de sobreentrenamiento',
      value: `${100 - fatigueAnalysis.fatigueIndex}%`,
      progress: 100 - fatigueAnalysis.fatigueIndex,
      category: 'recovery'
    });
  } else if (fatigueAnalysis.overreachingRisk === 'Medio') {
    indicators.push({
      type: 'warning',
      icon: 'AlertTriangle',
      title: 'Fatiga Moderada',
      description: 'Monitorea síntomas y considera más descanso',
      value: `${fatigueAnalysis.fatigueIndex}%`,
      progress: fatigueAnalysis.fatigueIndex,
      category: 'recovery'
    });
  } else {
    indicators.push({
      type: 'critical',
      icon: 'AlertTriangle',
      title: 'Riesgo de Fatiga',
      description: 'Alto riesgo de sobreentrenamiento - descanso necesario',
      value: `${fatigueAnalysis.fatigueIndex}%`,
      progress: fatigueAnalysis.fatigueIndex,
      category: 'recovery'
    });
  }

  // 6. INDICADOR DE VOLUMEN
  const recentVolume = thisWeekRecords.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0);
  const lastWeekVolume = lastWeekRecords.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0);

  if (recentVolume > 0 && lastWeekVolume > 0) {
    const volumeChange = ((recentVolume - lastWeekVolume) / lastWeekVolume) * 100;
    if (volumeChange > 20) {
      indicators.push({
        type: 'excellent',
        icon: 'Activity',
        title: 'Volumen en Alza',
        description: `+${Math.round(volumeChange)}% volumen vs semana pasada`,
        value: `+${Math.round(volumeChange)}%`,
        progress: Math.min(100, volumeChange * 2),
        category: 'volume'
      });
    } else if (volumeChange < -20) {
      indicators.push({
        type: 'warning',
        icon: 'Activity',
        title: 'Volumen Reducido',
        description: `${Math.round(volumeChange)}% volumen vs semana pasada`,
        value: `${Math.round(volumeChange)}%`,
        progress: Math.max(0, 100 + volumeChange),
        category: 'volume'
      });
    }
  } else if (recentVolume > 0 && lastWeekVolume === 0) {
    indicators.push({
      type: 'excellent',
      icon: 'Activity',
      title: 'Retorno al Entrenamiento',
      description: 'Excelente trabajo retomando los entrenamientos',
      value: `${Math.round(recentVolume / 1000)}k kg`,
      progress: 100,
      category: 'volume'
    });
  }

  // 7. INDICADOR DE PREDICCIÓN
  if (prediction.monthlyGrowthRate > 8) {
    indicators.push({
      type: 'excellent',
      icon: 'Target',
      title: 'Proyección Excepcional',
      description: `Crecimiento proyectado: ${prediction.monthlyGrowthRate}kg/mes`,
      value: `+${prediction.monthlyGrowthRate}kg`,
      progress: Math.min(100, prediction.monthlyGrowthRate * 8),
      category: 'prediction'
    });
  } else if (prediction.monthlyGrowthRate > 5) {
    indicators.push({
      type: 'excellent',
      icon: 'Target',
      title: 'Proyección Positiva',
      description: `Crecimiento esperado: ${prediction.monthlyGrowthRate}kg/mes`,
      value: `+${prediction.monthlyGrowthRate}kg`,
      progress: Math.min(100, prediction.monthlyGrowthRate * 12),
      category: 'prediction'
    });
  } else if (prediction.monthlyGrowthRate > 2) {
    indicators.push({
      type: 'good',
      icon: 'Target',
      title: 'Proyección Moderada',
      description: `Crecimiento esperado: ${prediction.monthlyGrowthRate}kg/mes`,
      value: `+${prediction.monthlyGrowthRate}kg`,
      progress: Math.min(100, prediction.monthlyGrowthRate * 20),
      category: 'prediction'
    });
  } else if (prediction.monthlyGrowthRate <= 0) {
    indicators.push({
      type: 'warning',
      icon: 'Target',
      title: 'Proyección Estancada',
      description: 'Proyección de crecimiento limitada - considera cambios',
      value: `${prediction.monthlyGrowthRate}kg`,
      progress: 30,
      category: 'prediction'
    });
  }

  // 8. INDICADOR DE RIESGO DE MESETA
  if (prediction.plateauRisk <= 20) {
    indicators.push({
      type: 'excellent',
      icon: 'TrendingUp',
      title: 'Sin Riesgo de Meseta',
      description: 'Progreso sostenible - baja probabilidad de estancamiento',
      value: `${prediction.plateauRisk}%`,
      progress: 100 - prediction.plateauRisk,
      category: 'plateau'
    });
  } else if (prediction.plateauRisk > 70) {
    indicators.push({
      type: 'critical',
      icon: 'AlertTriangle',
      title: 'Alto Riesgo Meseta',
      description: 'Probabilidad alta de estancamiento - varía tu rutina',
      value: `${prediction.plateauRisk}%`,
      progress: prediction.plateauRisk,
      category: 'plateau'
    });
  } else if (prediction.plateauRisk > 50) {
    indicators.push({
      type: 'warning',
      icon: 'Target',
      title: 'Riesgo Moderado Meseta',
      description: 'Considera variaciones en ejercicios y rangos',
      value: `${prediction.plateauRisk}%`,
      progress: prediction.plateauRisk,
      category: 'plateau'
    });
  }

  // 9. INDICADOR DE SEGURIDAD (basado en incrementos súbitos)
  const safetyAnalysis = analyzeSafetyPatterns(records);
  if (safetyAnalysis.rapidWeightIncrease > 20) {
    indicators.push({
      type: 'critical',
      icon: 'AlertTriangle',
      title: 'Incremento Peligroso',
      description: `+${Math.round(safetyAnalysis.rapidWeightIncrease)}% peso en 2 semanas - riesgo de lesión`,
      value: `+${Math.round(safetyAnalysis.rapidWeightIncrease)}%`,
      progress: Math.min(100, safetyAnalysis.rapidWeightIncrease * 3),
      category: 'safety'
    });
  } else if (safetyAnalysis.rapidWeightIncrease > 15) {
    indicators.push({
      type: 'warning',
      icon: 'AlertTriangle',
      title: 'Incremento Rápido',
      description: `+${Math.round(safetyAnalysis.rapidWeightIncrease)}% peso en 2 semanas - cuidado con la progresión`,
      value: `+${Math.round(safetyAnalysis.rapidWeightIncrease)}%`,
      progress: Math.min(100, safetyAnalysis.rapidWeightIncrease * 4),
      category: 'safety'
    });
  } else if (safetyAnalysis.rapidWeightIncrease > 10) {
    indicators.push({
      type: 'good',
      icon: 'CheckCircle',
      title: 'Progresión Segura',
      description: `+${Math.round(safetyAnalysis.rapidWeightIncrease)}% peso en 2 semanas - ritmo saludable`,
      value: `+${Math.round(safetyAnalysis.rapidWeightIncrease)}%`,
      progress: Math.min(100, safetyAnalysis.rapidWeightIncrease * 5),
      category: 'safety'
    });
  }

  // Ordenar por prioridad y limitar a 6 indicadores para no saturar la UI
  const sortedIndicators = indicators.sort((a, b) => {
    const priorityOrder = { 'excellent': 1, 'good': 2, 'warning': 3, 'critical': 4 };
    return priorityOrder[a.type] - priorityOrder[b.type];
  });

  return sortedIndicators.slice(0, 6);
};

/**
 * Función auxiliar para verificar la coherencia de las predicciones
 * Se utiliza principalmente para testing y validación
 */
export const validatePredictionCoherence = (records: WorkoutRecord[], prediction: ProgressPrediction): boolean => {
  if (records.length === 0) return true;

  const maxWeight = Math.max(...records.map(r => r.weight));
  const avgWeight = records.reduce((sum, r) => sum + r.weight, 0) / records.length;
  const totalVolume = records.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0);
  const avgVolume = totalVolume / records.length;

  // Validar que las predicciones estén en rangos razonables
  const weightCoherent = prediction.nextWeekWeight >= avgWeight * 0.7 && prediction.nextWeekWeight <= maxWeight * 1.3;
  const volumeCoherent = prediction.nextWeekVolume >= avgVolume * 0.5 && prediction.nextWeekVolume <= avgVolume * 2;
  const monthlyGrowthCoherent = Math.abs(prediction.monthlyGrowthRate) <= 8;
  const trendsCoherent = Math.abs(prediction.strengthTrend) <= 2 && Math.abs(prediction.volumeTrend) <= 100;

  return weightCoherent && volumeCoherent && monthlyGrowthCoherent && trendsCoherent;
};

/**
 * Función de testing mejorada para verificar la coherencia de predicciones
 * Detecta y reporta problemas específicos como los mencionados por el usuario
 */
export const testPredictionCoherence = (records: WorkoutRecord[]): {
  valid: boolean;
  issues: string[];
  corrections: string[];
  originalPrediction: ProgressPrediction;
  correctedPrediction: ProgressPrediction;
} => {
  if (records.length === 0) {
    return {
      valid: true,
      issues: [],
      corrections: [],
      originalPrediction: predictProgress(records),
      correctedPrediction: predictProgress(records)
    };
  }

  const originalPrediction = predictProgress(records);
  const basicMetrics = calculateBasicMetrics(getValidSortedRecords(records));
  const issues: string[] = [];
  const corrections: string[] = [];

  // 1. Verificar inconsistencia peso próxima semana vs PR
  const weightToPRRatio = originalPrediction.nextWeekWeight / originalPrediction.predictedPR.weight;
  if (weightToPRRatio > 0.85) {
    issues.push(`Peso próxima semana muy alto vs PR: ${originalPrediction.nextWeekWeight}kg (${(weightToPRRatio * 100).toFixed(1)}% del PR)`);
    corrections.push('Peso próxima semana ajustado al 85% del PR máximo');
  } else if (weightToPRRatio < 0.4) {
    issues.push(`Peso próxima semana muy bajo vs PR: ${originalPrediction.nextWeekWeight}kg (${(weightToPRRatio * 100).toFixed(1)}% del PR)`);
    corrections.push('Posible inconsistencia entre métricas de trabajo y 1RM');
  }

  // 2. Verificar decimales excesivos
  const prDecimals = (originalPrediction.predictedPR.weight.toString().split('.')[1] || '').length;
  if (prDecimals > 2) {
    issues.push(`PR con decimales excesivos: ${originalPrediction.predictedPR.weight}kg (${prDecimals} decimales)`);
    corrections.push('Redondeo a 2 decimales aplicado');
  }

  // 3. Verificar tendencias irreales (límites más estrictos)
  if (Math.abs(originalPrediction.volumeTrend) >= 50) {
    issues.push(`Tendencia de volumen irreal: ${originalPrediction.volumeTrend}kg/semana (debe estar entre ±50kg)`);
    corrections.push('Tendencia de volumen limitada a rangos realistas');
  }

  if (Math.abs(originalPrediction.strengthTrend) >= 1.5) {
    issues.push(`Tendencia de fuerza irreal: ${originalPrediction.strengthTrend}kg/semana (debe estar entre ±1.5kg)`);
    corrections.push('Tendencia de fuerza limitada a ±1.5kg/semana');
  }

  // 4. Verificar mejora de PR vs 1RM actual
  const current1RM = basicMetrics.current1RMMax;
  const prImprovement = originalPrediction.predictedPR.weight - current1RM;
  const improvementPercent = (prImprovement / current1RM) * 100;

  if (improvementPercent > 15) {
    issues.push(`Mejora de PR excesiva: +${prImprovement.toFixed(1)}kg (${improvementPercent.toFixed(1)}%)`);
    corrections.push('Mejora de PR limitada al 15% del 1RM actual');
  }

  // 5. Verificar coherencia tiempo hasta PR
  if (originalPrediction.strengthTrend > 0) {
    const impliedWeeks = prImprovement / originalPrediction.strengthTrend;
    const timeDifference = Math.abs(originalPrediction.timeToNextPR - impliedWeeks);

    if (timeDifference > 4) {
      issues.push(`Tiempo hasta PR incoherente: ${originalPrediction.timeToNextPR} semanas vs ${impliedWeeks.toFixed(1)} semanas implícitas`);
      corrections.push('Tiempo hasta PR recalculado basado en tendencia');
    }
  }

  // Generar predicción corregida para comparación
  const correctedPrediction = predictProgress(records); // Ya incluye todas las correcciones

  return {
    valid: issues.length === 0,
    issues,
    corrections,
    originalPrediction,
    correctedPrediction
  };
};

/**
 * Función de testing para verificar que las predicciones están en rangos realistas
 * Solo para desarrollo y debug - no afecta la producción
 */
export const testPredictionRanges = (records: WorkoutRecord[]): { valid: boolean; issues: string[] } => {
  const prediction = predictProgress(records);
  const issues: string[] = [];

  // Verificar tendencia de fuerza
  if (Math.abs(prediction.strengthTrend) > 2) {
    issues.push(`Tendencia de fuerza irreal: ${prediction.strengthTrend}kg/semana (máximo: ±2kg/semana)`);
  }

  // Verificar tendencia de volumen
  if (Math.abs(prediction.volumeTrend) > 100) {
    issues.push(`Tendencia de volumen irreal: ${prediction.volumeTrend}kg/semana (máximo: ±100kg/semana)`);
  }

  // Verificar crecimiento mensual
  if (Math.abs(prediction.monthlyGrowthRate) > 8) {
    issues.push(`Crecimiento mensual irreal: ${prediction.monthlyGrowthRate}kg/mes (máximo: ±8kg/mes)`);
  }

  // Verificar PR predicho
  const current1RM = Math.max(...records.map(r => calculateOptimal1RM(r.weight, r.reps)));
  const prIncrease = prediction.predictedPR.weight - current1RM;
  if (prIncrease > current1RM * 0.15) {
    issues.push(`Mejora de PR irreal: +${prIncrease.toFixed(1)}kg (máximo: 15% del actual)`);
  }

  // Verificar tiempo hasta PR
  if (prediction.timeToNextPR > 12) {
    issues.push(`Tiempo hasta PR irreal: ${prediction.timeToNextPR} semanas (máximo: 12 semanas)`);
  }

  // Verificar peso próxima semana
  const currentAvgWeight = records.slice(-5).reduce((sum, r) => sum + r.weight, 0) / Math.min(5, records.length);
  const weightIncrease = prediction.nextWeekWeight - currentAvgWeight;
  if (Math.abs(weightIncrease) > 2) {
    issues.push(`Cambio de peso próxima semana irreal: ${weightIncrease > 0 ? '+' : ''}${weightIncrease.toFixed(1)}kg (máximo: ±2kg)`);
  }

  return {
    valid: issues.length === 0,
    issues
  };
};



