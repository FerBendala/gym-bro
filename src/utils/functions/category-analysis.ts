import { differenceInDays, endOfMonth, endOfWeek, format, startOfMonth, startOfWeek, subMonths, subWeeks } from 'date-fns';
import { es } from 'date-fns/locale';
import { EXERCISE_CATEGORIES } from '../../constants/exercise-categories';
import type { WorkoutRecord } from '../../interfaces';

/**
 * Obtiene la fecha "actual" basada en los datos reales del usuario
 * En lugar de usar new Date() que puede estar en un año diferente
 */
const getCurrentDateFromRecords = (records: WorkoutRecord[]): Date => {
  if (records.length === 0) {
    return new Date(); // Fallback a fecha del sistema si no hay datos
  }

  // Usar la fecha más reciente de los entrenamientos
  const latestDate = new Date(Math.max(...records.map(r => new Date(r.date).getTime())));

  // En lugar de verificar si es "muy antigua", simplemente usar la fecha más reciente
  // esto maneja tanto datos pasados como futuros correctamente
  return latestDate;
};

/**
 * Interfaz para métricas por categoría avanzadas
 */
export interface CategoryMetrics {
  category: string;
  workouts: number;
  totalVolume: number;
  avgWeight: number;
  maxWeight: number;
  avgWorkoutsPerWeek: number;
  lastWorkout: Date | null;
  percentage: number; // Porcentaje del total de entrenamientos
  // Nuevas métricas avanzadas
  minWeight: number;
  avgSets: number;
  avgReps: number;
  totalSets: number;
  totalReps: number;
  personalRecords: number;
  estimatedOneRM: number;
  weightProgression: number; // Porcentaje de progreso vs período anterior
  volumeProgression: number; // Porcentaje de progreso vs período anterior
  intensityScore: number; // 0-100 basado en peso vs máximo
  efficiencyScore: number; // Volumen por sesión
  consistencyScore: number; // Regularidad de entrenamientos
  daysSinceLastWorkout: number;
  trend: 'improving' | 'stable' | 'declining';
  strengthLevel: 'beginner' | 'intermediate' | 'advanced';
  volumeDistribution: {
    thisWeek: number;
    lastWeek: number;
    thisMonth: number;
    lastMonth: number;
  };
  performanceMetrics: {
    bestSession: {
      date: Date;
      volume: number;
      maxWeight: number;
    };
    averageSessionVolume: number;
    volumePerWorkout: number;
    sessionsAboveAverage: number;
  };
  recommendations: string[];
  warnings: string[];
}

/**
 * Interfaz para balance muscular avanzado
 */
export interface MuscleBalance {
  category: string;
  volume: number;
  percentage: number;
  isBalanced: boolean;
  recommendation: string;
  // Nuevas métricas avanzadas
  idealPercentage: number;
  deviation: number;
  symmetryScore: number;
  antagonistRatio: number;
  strengthIndex: number;
  progressTrend: 'improving' | 'stable' | 'declining';
  lastImprovement: Date | null;
  priorityLevel: 'low' | 'medium' | 'high' | 'critical';
  developmentStage: 'beginner' | 'intermediate' | 'advanced' | 'neglected';
  weeklyFrequency: number;
  intensityScore: number;
  balanceHistory: {
    trend: 'improving' | 'stable' | 'declining';
    consistency: number;
    volatility: number;
  };
  specificRecommendations: string[];
  warnings: string[];
}

/**
 * Interfaz para análisis de categorías
 */
export interface CategoryAnalysis {
  categoryMetrics: CategoryMetrics[];
  muscleBalance: MuscleBalance[];
  dominantCategory: string | null;
  leastTrainedCategory: string | null;
  balanceScore: number; // 0-100, donde 100 es perfectamente balanceado
}

/**
 * Calcula el número de PRs para una categoría
 */
const calculatePersonalRecords = (categoryRecords: WorkoutRecord[]): number => {
  if (categoryRecords.length === 0) return 0;

  const prCount = new Set();
  const sortedRecords = [...categoryRecords].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let currentMax = 0;
  sortedRecords.forEach(record => {
    if (record.weight > currentMax) {
      currentMax = record.weight;
      prCount.add(record.id);
    }
  });

  return prCount.size;
};

/**
 * Calcula la progresión de peso para una categoría
 * Usa 1RM estimado siempre para mayor precisión y consistencia
 */
const calculateWeightProgression = (categoryRecords: WorkoutRecord[]): number => {
  if (categoryRecords.length < 2) return 0;

  const sortedRecords = [...categoryRecords].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Siempre comparar primera mitad vs segunda mitad para máxima precisión temporal
  const midpoint = Math.floor(sortedRecords.length / 2);
  const firstHalf = sortedRecords.slice(0, midpoint);
  const secondHalf = sortedRecords.slice(midpoint);

  if (firstHalf.length === 0 || secondHalf.length === 0) return 0;

  // Usar 1RM estimado SIEMPRE para precisión y consistencia
  const firstHalfAvg1RM = firstHalf.reduce((sum, r) => {
    const oneRM = r.weight * (1 + Math.min(r.reps, 20) / 30);
    return sum + oneRM;
  }, 0) / firstHalf.length;

  const secondHalfAvg1RM = secondHalf.reduce((sum, r) => {
    const oneRM = r.weight * (1 + Math.min(r.reps, 20) / 30);
    return sum + oneRM;
  }, 0) / secondHalf.length;

  if (firstHalfAvg1RM === 0) return 0;

  return Math.round(((secondHalfAvg1RM - firstHalfAvg1RM) / firstHalfAvg1RM) * 100);
};

/**
 * Calcula la progresión de volumen para una categoría
 */
const calculateVolumeProgression = (categoryRecords: WorkoutRecord[]): number => {
  if (categoryRecords.length < 2) return 0;

  // Agrupar por semanas para detectar cuántas semanas de datos tenemos
  const weeklyData = new Map<string, WorkoutRecord[]>();

  categoryRecords.forEach(record => {
    const date = new Date(record.date);
    const monday = new Date(date);
    monday.setDate(date.getDate() - date.getDay() + 1);
    const weekKey = monday.toISOString().split('T')[0];

    if (!weeklyData.has(weekKey)) {
      weeklyData.set(weekKey, []);
    }
    weeklyData.get(weekKey)!.push(record);
  });

  const weeksWithData = weeklyData.size;

  // Si tenemos 3 semanas o menos, comparar primera mitad vs segunda mitad de registros
  if (weeksWithData <= 3) {
    const sortedRecords = [...categoryRecords].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const midpoint = Math.floor(sortedRecords.length / 2);
    const firstHalf = sortedRecords.slice(0, midpoint);
    const secondHalf = sortedRecords.slice(midpoint);

    if (firstHalf.length === 0 || secondHalf.length === 0) return 0;

    const firstHalfVolume = firstHalf.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0);
    const secondHalfVolume = secondHalf.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0);

    if (firstHalfVolume === 0) return 0;

    return Math.round(((secondHalfVolume - firstHalfVolume) / firstHalfVolume) * 100);
  }

  // Para usuarios con más semanas de datos, usar la lógica original
  const now = new Date();
  const twoWeeksAgo = new Date(now.getTime() - (14 * 24 * 60 * 60 * 1000));
  const fourWeeksAgo = new Date(now.getTime() - (28 * 24 * 60 * 60 * 1000));

  const recentRecords = categoryRecords.filter(r => new Date(r.date) >= twoWeeksAgo);
  const olderRecords = categoryRecords.filter(r => {
    const date = new Date(r.date);
    return date >= fourWeeksAgo && date < twoWeeksAgo;
  });

  if (recentRecords.length === 0 || olderRecords.length === 0) return 0;

  const recentVolume = recentRecords.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0);
  const olderVolume = olderRecords.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0);

  if (olderVolume === 0) return 0;

  return Math.round(((recentVolume - olderVolume) / olderVolume) * 100);
};

/**
 * Calcula el score de intensidad para una categoría
 * Exportada para uso en múltiples componentes
 */
export const calculateIntensityScore = (categoryRecords: WorkoutRecord[]): number => {
  if (categoryRecords.length === 0) return 0;

  // Calcular 1RM estimado para cada registro
  const oneRMs = categoryRecords.map(r => r.weight * (1 + Math.min(r.reps, 20) / 30));

  const maxOneRM = Math.max(...oneRMs);
  const avgOneRM = oneRMs.reduce((sum, orm) => sum + orm, 0) / oneRMs.length;

  if (maxOneRM === 0) return 0;

  // Intensidad basada en % de 1RM (más precisa)
  const intensityPercentage = (avgOneRM / maxOneRM) * 100;
  return Math.round(intensityPercentage);
};

/**
 * Calcula el score de eficiencia para una categoría
 */
const calculateEfficiencyScore = (categoryRecords: WorkoutRecord[]): number => {
  if (categoryRecords.length === 0) return 0;

  const totalVolume = categoryRecords.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0);
  const avgVolumePerWorkout = totalVolume / categoryRecords.length;

  // Normalizar a escala 0-100 basado en volumen promedio esperado
  return Math.min(100, Math.round((avgVolumePerWorkout / 500) * 100));
};

/**
 * Calcula el score de consistencia para una categoría
 */
const calculateConsistencyScore = (categoryRecords: WorkoutRecord[], avgWorkoutsPerWeek: number): number => {
  if (categoryRecords.length === 0) return 0;

  // Basado en frecuencia semanal y regularidad
  const frequencyScore = Math.min(100, (avgWorkoutsPerWeek / 3) * 100); // 3 sesiones por semana es ideal

  // Calcular regularidad (varianza en días entre entrenamientos)
  const sortedRecords = [...categoryRecords].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  if (sortedRecords.length < 2) return frequencyScore;

  const daysBetweenWorkouts: number[] = [];
  for (let i = 1; i < sortedRecords.length; i++) {
    const days = Math.floor((new Date(sortedRecords[i].date).getTime() - new Date(sortedRecords[i - 1].date).getTime()) / (1000 * 60 * 60 * 24));
    daysBetweenWorkouts.push(days);
  }

  const avgDaysBetween = daysBetweenWorkouts.reduce((sum, days) => sum + days, 0) / daysBetweenWorkouts.length;
  const variance = daysBetweenWorkouts.reduce((sum, days) => sum + Math.pow(days - avgDaysBetween, 2), 0) / daysBetweenWorkouts.length;
  const regularityScore = Math.max(0, 100 - Math.sqrt(variance));

  return Math.round((frequencyScore + regularityScore) / 2);
};

/**
 * Determina el nivel de fuerza para una categoría
 */
const determineStrengthLevel = (estimatedOneRM: number, category: string): 'beginner' | 'intermediate' | 'advanced' => {
  // Estándares simplificados por categoría (en kg)
  const standards: Record<string, { intermediate: number; advanced: number }> = {
    'Pecho': { intermediate: 80, advanced: 120 },
    'Espalda': { intermediate: 90, advanced: 140 },
    'Piernas': { intermediate: 100, advanced: 160 },
    'Hombros': { intermediate: 60, advanced: 90 },
    'Brazos': { intermediate: 50, advanced: 80 },
    'Core': { intermediate: 40, advanced: 70 },
    'Cardio': { intermediate: 30, advanced: 50 },
    'Funcional': { intermediate: 70, advanced: 110 }
  };

  const categoryStandards = standards[category] || { intermediate: 60, advanced: 100 };

  if (estimatedOneRM >= categoryStandards.advanced) return 'advanced';
  if (estimatedOneRM >= categoryStandards.intermediate) return 'intermediate';
  return 'beginner';
};

/**
 * Calcula la distribución de volumen temporal para una categoría
 */
const calculateVolumeDistribution = (categoryRecords: WorkoutRecord[], allRecords?: WorkoutRecord[]): {
  thisWeek: number;
  lastWeek: number;
  thisMonth: number;
  lastMonth: number;
} => {
  // Usar la fecha actual basada en los datos reales
  const now = getCurrentDateFromRecords(allRecords || categoryRecords);

  // Usar date-fns con locale español para consistencia
  const thisWeekStart = startOfWeek(now, { locale: es });
  const thisWeekEnd = endOfWeek(now, { locale: es });

  const lastWeekStart = startOfWeek(subWeeks(now, 1), { locale: es });
  const lastWeekEnd = endOfWeek(subWeeks(now, 1), { locale: es });

  // Usar funciones de date-fns para meses reales del calendario
  const thisMonthStart = startOfMonth(now);
  const thisMonthEnd = endOfMonth(now);

  const lastMonthStart = startOfMonth(subMonths(now, 1));
  const lastMonthEnd = endOfMonth(subMonths(now, 1));

  const thisWeekRecords = categoryRecords.filter(r => {
    const date = new Date(r.date);
    return date >= thisWeekStart && date <= thisWeekEnd;
  });

  const lastWeekRecords = categoryRecords.filter(r => {
    const date = new Date(r.date);
    return date >= lastWeekStart && date <= lastWeekEnd;
  });

  const thisMonthRecords = categoryRecords.filter(r => {
    const date = new Date(r.date);
    return date >= thisMonthStart && date <= thisMonthEnd;
  });

  const lastMonthRecords = categoryRecords.filter(r => {
    const date = new Date(r.date);
    return date >= lastMonthStart && date <= lastMonthEnd;
  });

  return {
    thisWeek: thisWeekRecords.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0),
    lastWeek: lastWeekRecords.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0),
    thisMonth: thisMonthRecords.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0),
    lastMonth: lastMonthRecords.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0)
  };
};

/**
 * Calcula las métricas de rendimiento para una categoría
 */
const calculateCategoryPerformanceMetrics = (categoryRecords: WorkoutRecord[]) => {
  if (categoryRecords.length === 0) {
    return {
      bestSession: { date: new Date(), volume: 0, maxWeight: 0 },
      averageSessionVolume: 0,
      volumePerWorkout: 0,
      sessionsAboveAverage: 0
    };
  }

  // Agrupar por sesión (por fecha)
  const sessionMap: Record<string, WorkoutRecord[]> = {};
  categoryRecords.forEach(record => {
    const dateKey = new Date(record.date).toDateString();
    if (!sessionMap[dateKey]) sessionMap[dateKey] = [];
    sessionMap[dateKey].push(record);
  });

  const sessions = Object.entries(sessionMap).map(([dateStr, records]) => ({
    date: new Date(dateStr),
    volume: records.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0),
    maxWeight: Math.max(...records.map(r => r.weight))
  }));

  const bestSession = sessions.reduce((best, session) =>
    session.volume > best.volume ? session : best
  );

  const averageSessionVolume = sessions.reduce((sum, s) => sum + s.volume, 0) / sessions.length;
  const volumePerWorkout = averageSessionVolume;
  const sessionsAboveAverage = sessions.filter(s => s.volume > averageSessionVolume).length;

  return {
    bestSession,
    averageSessionVolume: Math.round(averageSessionVolume),
    volumePerWorkout: Math.round(volumePerWorkout),
    sessionsAboveAverage
  };
};

/**
 * Genera recomendaciones para una categoría
 */
const generateCategoryRecommendations = (
  category: string,
  metrics: Partial<CategoryMetrics>
): string[] => {
  const recommendations: string[] = [];

  if (metrics.daysSinceLastWorkout && metrics.daysSinceLastWorkout > 7) {
    recommendations.push(`Retomar entrenamientos de ${category.toLowerCase()} - ${metrics.daysSinceLastWorkout} días sin actividad`);
  }

  if (metrics.avgWorkoutsPerWeek && metrics.avgWorkoutsPerWeek < 2) {
    recommendations.push(`Aumentar frecuencia de ${category.toLowerCase()} a 2-3 sesiones por semana`);
  }

  if (metrics.weightProgression && metrics.weightProgression < 0) {
    recommendations.push(`Revisar progresión de peso en ${category.toLowerCase()} - tendencia negativa`);
  }

  if (metrics.consistencyScore && metrics.consistencyScore < 60) {
    recommendations.push(`Mejorar consistencia en entrenamientos de ${category.toLowerCase()}`);
  }

  if (metrics.strengthLevel === 'beginner' && metrics.workouts && metrics.workouts > 20) {
    recommendations.push(`Considerar aumentar intensidad en ${category.toLowerCase()}`);
  }

  return recommendations;
};

/**
 * Genera advertencias para una categoría
 */
const generateCategoryWarnings = (
  category: string,
  metrics: Partial<CategoryMetrics>
): string[] => {
  const warnings: string[] = [];

  if (metrics.daysSinceLastWorkout && metrics.daysSinceLastWorkout > 14) {
    warnings.push(`${category} sin actividad por ${metrics.daysSinceLastWorkout} días`);
  }

  if (metrics.trend === 'declining') {
    warnings.push(`Tendencia negativa en ${category.toLowerCase()}`);
  }

  if (metrics.weightProgression && metrics.weightProgression < -10) {
    warnings.push(`Pérdida significativa de fuerza en ${category.toLowerCase()}`);
  }

  if (metrics.avgWorkoutsPerWeek && metrics.avgWorkoutsPerWeek < 1) {
    warnings.push(`Frecuencia muy baja en ${category.toLowerCase()}`);
  }

  return warnings;
};

/**
 * Calcula métricas por categoría de ejercicio con análisis avanzado
 * Ahora maneja ejercicios con múltiples categorías
 */
export const calculateCategoryMetrics = (records: WorkoutRecord[]): CategoryMetrics[] => {
  if (records.length === 0) return [];

  // Agrupar records por categoría (un record puede contar para múltiples categorías)
  const recordsByCategory: Record<string, WorkoutRecord[]> = {};
  const workoutsByCategory: Record<string, number> = {};
  const volumeByCategory: Record<string, number> = {};

  records.forEach(record => {
    const categories = record.exercise?.categories || [];

    if (categories.length === 0) {
      // Sin categorías
      const category = 'Sin categoría';
      if (!recordsByCategory[category]) {
        recordsByCategory[category] = [];
        workoutsByCategory[category] = 0;
        volumeByCategory[category] = 0;
      }
      recordsByCategory[category].push(record);
      workoutsByCategory[category]++;
      volumeByCategory[category] += record.weight * record.reps * record.sets;
    } else {
      // Distribuir entre múltiples categorías
      const volumePerCategory = (record.weight * record.reps * record.sets) / categories.length;
      const workoutContribution = 1 / categories.length;

      categories.forEach(category => {
        if (!recordsByCategory[category]) {
          recordsByCategory[category] = [];
          workoutsByCategory[category] = 0;
          volumeByCategory[category] = 0;
        }
        recordsByCategory[category].push(record);
        workoutsByCategory[category] += workoutContribution;
        volumeByCategory[category] += volumePerCategory;
      });
    }
  });

  const totalWorkouts = Object.values(workoutsByCategory).reduce((sum, count) => sum + count, 0);
  const metrics: CategoryMetrics[] = [];

  // Obtener fecha actual basada en los datos reales
  const currentDate = getCurrentDateFromRecords(records);

  // Calcular métricas para cada categoría
  Object.entries(recordsByCategory).forEach(([category, categoryRecords]) => {
    const workouts = workoutsByCategory[category];
    const totalVolume = volumeByCategory[category];

    // Calcular pesos promedio, máximo y mínimo considerando todos los ejercicios de la categoría
    const weights = categoryRecords.map(record => record.weight);
    const avgWeight = weights.reduce((sum, weight) => sum + weight, 0) / weights.length;
    const maxWeight = Math.max(...weights);
    const minWeight = Math.min(...weights);

    // Calcular sets y reps promedio y totales
    const sets = categoryRecords.map(record => record.sets);
    const reps = categoryRecords.map(record => record.reps);
    const avgSets = sets.reduce((sum, s) => sum + s, 0) / sets.length;
    const avgReps = reps.reduce((sum, r) => sum + r, 0) / reps.length;
    const totalSets = sets.reduce((sum, s) => sum + s, 0);
    const totalReps = reps.reduce((sum, r) => sum + r, 0);

    // Calcular entrenamientos por semana aproximado - CORREGIDO
    const dates = categoryRecords.map(record => new Date(record.date));
    const uniqueDates = [...new Set(dates.map(d => d.toDateString()))];

    // Agrupar por semanas para calcular frecuencia semanal real
    const weeklyData = new Map<string, Set<string>>();

    categoryRecords.forEach(record => {
      const date = new Date(record.date);
      // Obtener el lunes de la semana
      const monday = new Date(date);
      monday.setDate(date.getDate() - date.getDay() + 1);
      const weekKey = monday.toISOString().split('T')[0];

      if (!weeklyData.has(weekKey)) {
        weeklyData.set(weekKey, new Set());
      }
      weeklyData.get(weekKey)!.add(record.date.toDateString());
    });

    // Calcular promedio de días únicos por semana solo para semanas con entrenamientos
    const avgWorkoutsPerWeek = weeklyData.size > 0
      ? Array.from(weeklyData.values()).reduce((sum, daysSet) => sum + daysSet.size, 0) / weeklyData.size
      : 0;

    const lastWorkout = new Date(Math.max(...dates.map(d => d.getTime())));
    const percentage = (workouts / totalWorkouts) * 100;

    // Calcular métricas avanzadas
    const personalRecords = calculatePersonalRecords(categoryRecords);
    const estimatedOneRM = categoryRecords.length > 0 ?
      Math.max(...categoryRecords.map(r => r.weight * (1 + Math.min(r.reps, 20) / 30))) : 0;

    const weightProgression = calculateWeightProgression(categoryRecords);
    const volumeProgression = calculateVolumeProgression(categoryRecords);
    const intensityScore = calculateIntensityScore(categoryRecords);
    const efficiencyScore = calculateEfficiencyScore(categoryRecords);
    const consistencyScore = calculateConsistencyScore(categoryRecords, avgWorkoutsPerWeek);

    // Usar fecha actual basada en los datos reales en lugar de new Date()
    const daysSinceLastWorkout = Math.floor((currentDate.getTime() - lastWorkout.getTime()) / (1000 * 60 * 60 * 24));

    // Determinar tendencia basada en progresión de peso y volumen
    let trend: 'improving' | 'stable' | 'declining' = 'stable';
    if (weightProgression > 5 || volumeProgression > 5) trend = 'improving';
    else if (weightProgression < -5 || volumeProgression < -5) trend = 'declining';

    const strengthLevel = determineStrengthLevel(estimatedOneRM, category);

    // Pasar todos los records como segundo parámetro para cálculo correcto de fechas
    const volumeDistribution = calculateVolumeDistribution(categoryRecords, records);

    const performanceMetrics = calculateCategoryPerformanceMetrics(categoryRecords);

    // Crear objeto base
    const baseMetrics: Partial<CategoryMetrics> = {
      category,
      workouts: Math.round(workouts * 100) / 100,
      totalVolume: Math.round(totalVolume),
      avgWeight: Math.round(avgWeight * 100) / 100,
      maxWeight,
      minWeight,
      avgSets: Math.round(avgSets * 100) / 100,
      avgReps: Math.round(avgReps * 100) / 100,
      totalSets,
      totalReps,
      avgWorkoutsPerWeek: Math.round(avgWorkoutsPerWeek * 100) / 100,
      lastWorkout,
      percentage: Math.round(percentage * 100) / 100,
      personalRecords,
      estimatedOneRM: Math.round(estimatedOneRM),
      weightProgression,
      volumeProgression,
      intensityScore,
      efficiencyScore,
      consistencyScore,
      daysSinceLastWorkout,
      trend,
      strengthLevel,
      volumeDistribution,
      performanceMetrics
    };

    // Generar recomendaciones y advertencias
    const recommendations = generateCategoryRecommendations(category, baseMetrics);
    const warnings = generateCategoryWarnings(category, baseMetrics);

    // Crear objeto completo
    metrics.push({
      ...baseMetrics,
      recommendations,
      warnings
    } as CategoryMetrics);
  });

  // Ordenar por volumen total descendente
  return metrics.sort((a, b) => b.totalVolume - a.totalVolume);
};

/**
 * Calcula el índice de simetría para un grupo muscular
 */
const calculateSymmetryScore = (category: string, categoryRecords: WorkoutRecord[]): number => {
  if (categoryRecords.length === 0) return 0;

  // Análisis de simetría basado en variabilidad de pesos y repeticiones
  const weights = categoryRecords.map(r => r.weight);
  const reps = categoryRecords.map(r => r.reps);

  // Coeficiente de variación para pesos
  const weightMean = weights.reduce((sum, w) => sum + w, 0) / weights.length;
  const weightVariance = weights.reduce((sum, w) => sum + Math.pow(w - weightMean, 2), 0) / weights.length;
  const weightCV = weightVariance > 0 ? Math.sqrt(weightVariance) / weightMean : 0;

  // Coeficiente de variación para repeticiones
  const repMean = reps.reduce((sum, r) => sum + r, 0) / reps.length;
  const repVariance = reps.reduce((sum, r) => sum + Math.pow(r - repMean, 2), 0) / reps.length;
  const repCV = repVariance > 0 ? Math.sqrt(repVariance) / repMean : 0;

  // Score de simetría: menor variabilidad = mejor simetría
  const symmetryScore = Math.max(0, 100 - ((weightCV + repCV) * 50));
  return Math.round(symmetryScore);
};

/**
 * Calcula el ratio antagonista para un grupo muscular
 */
const calculateAntagonistRatio = (category: string, categoryMetrics: CategoryMetrics[]): number => {
  const antagonistPairs: Record<string, string> = {
    'Pecho': 'Espalda',
    'Espalda': 'Pecho',
    'Brazos': 'Piernas', // Simplificado
    'Piernas': 'Brazos',
    'Hombros': 'Core',
    'Core': 'Hombros'
  };

  const antagonist = antagonistPairs[category];
  if (!antagonist) return 1; // No hay antagonista directo

  const currentMetric = categoryMetrics.find(m => m.category === category);
  const antagonistMetric = categoryMetrics.find(m => m.category === antagonist);

  if (!currentMetric || !antagonistMetric || antagonistMetric.totalVolume === 0) {
    return 0;
  }

  return Math.round((currentMetric.totalVolume / antagonistMetric.totalVolume) * 100) / 100;
};

/**
 * Calcula el índice de fuerza para un grupo muscular
 */
const calculateStrengthIndex = (categoryRecords: WorkoutRecord[]): number => {
  if (categoryRecords.length === 0) return 0;

  // Calcular 1RM estimado promedio
  const estimatedOneRMs = categoryRecords.map(record => {
    return record.weight * (1 + Math.min(record.reps, 20) / 30);
  });

  const avgOneRM = estimatedOneRMs.reduce((sum, orm) => sum + orm, 0) / estimatedOneRMs.length;

  // Normalizar a escala 0-100 (asumiendo que 100kg es un buen baseline)
  return Math.min(100, Math.round((avgOneRM / 100) * 100));
};

/**
 * Calcula un factor de ajuste temporal para métricas cuando hay pocos datos
 * @param records - Todos los registros de entrenamiento
 * @returns Factor entre 0.3 y 1.0 basado en el tiempo y cantidad de datos
 */
const calculateTemporalAdjustmentFactor = (records: WorkoutRecord[]): number => {
  if (records.length === 0) return 0.3;

  // Calcular días desde el primer registro
  const dates = records.map(r => new Date(r.date).getTime());
  const earliestDate = new Date(Math.min(...dates));
  const latestDate = new Date(Math.max(...dates));
  const daysSinceStart = Math.max(1, differenceInDays(latestDate, earliestDate));

  // Factores de ajuste
  const recordsFactor = Math.min(1, records.length / 50); // 50 registros = factor 1.0
  const timeFactor = Math.min(1, daysSinceStart / 60); // 60 días = factor 1.0
  const uniqueDaysFactor = Math.min(1, new Set(records.map(r => format(new Date(r.date), 'yyyy-MM-dd'))).size / 20); // 20 días únicos = factor 1.0

  // Combinar factores (promedio ponderado)
  const combinedFactor = (recordsFactor * 0.4 + timeFactor * 0.4 + uniqueDaysFactor * 0.2);

  // Asegurar un mínimo de 0.3 para que las métricas no sean demasiado bajas
  return Math.max(0.3, Math.min(1, combinedFactor));
};

/**
 * Ajusta las métricas según el tiempo y cantidad de datos disponibles
 */
const adjustMetricsForLimitedData = (
  metric: number,
  adjustmentFactor: number,
  metricType: 'percentage' | 'score' | 'frequency' = 'score'
): number => {
  if (metricType === 'percentage') {
    // Para porcentajes, ajustar hacia un valor medio (50%)
    return Math.round(metric * adjustmentFactor + 50 * (1 - adjustmentFactor));
  } else if (metricType === 'frequency') {
    // Para frecuencias, no ajustar demasiado
    return metric;
  } else {
    // Para scores, ajustar proporcionalmente pero mantener un mínimo
    const minScore = 30; // Score mínimo para usuarios nuevos
    return Math.round(Math.max(minScore, metric * adjustmentFactor + minScore * (1 - adjustmentFactor)));
  }
};

/**
 * Analiza la tendencia de progreso para un grupo muscular
 * Corregido para usar 1RM estimado consistentemente
 */
const analyzeProgressTrend = (categoryRecords: WorkoutRecord[]): {
  trend: 'improving' | 'stable' | 'declining';
  lastImprovement: Date | null;
} => {
  if (categoryRecords.length < 4) {
    return { trend: 'stable', lastImprovement: null };
  }

  // Ordenar por fecha
  const sortedRecords = [...categoryRecords].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Usar primera mitad vs segunda mitad para máxima precisión temporal
  const midpoint = Math.floor(sortedRecords.length / 2);
  const firstHalf = sortedRecords.slice(0, midpoint);
  const secondHalf = sortedRecords.slice(midpoint);

  if (firstHalf.length === 0 || secondHalf.length === 0) {
    return { trend: 'stable', lastImprovement: null };
  }

  // Calcular 1RM promedio para cada mitad - CORREGIDO
  const firstHalfAvg1RM = firstHalf.reduce((sum, r) => {
    const oneRM = r.weight * (1 + Math.min(r.reps, 20) / 30);
    return sum + oneRM;
  }, 0) / firstHalf.length;

  const secondHalfAvg1RM = secondHalf.reduce((sum, r) => {
    const oneRM = r.weight * (1 + Math.min(r.reps, 20) / 30);
    return sum + oneRM;
  }, 0) / secondHalf.length;

  const improvement = firstHalfAvg1RM > 0 ? ((secondHalfAvg1RM - firstHalfAvg1RM) / firstHalfAvg1RM) * 100 : 0;

  let trend: 'improving' | 'stable' | 'declining';
  if (improvement > 5) trend = 'improving';
  else if (improvement < -5) trend = 'declining';
  else trend = 'stable';

  // Encontrar último record con mejora significativa usando 1RM
  let lastImprovement: Date | null = null;
  for (let i = 1; i < sortedRecords.length; i++) {
    const current = sortedRecords[i];
    const previous = sortedRecords[i - 1];

    const current1RM = current.weight * (1 + Math.min(current.reps, 20) / 30);
    const previous1RM = previous.weight * (1 + Math.min(previous.reps, 20) / 30);

    if (current1RM > previous1RM * 1.05) { // Mejora del 5% en 1RM
      lastImprovement = new Date(current.date);
    }
  }

  return { trend, lastImprovement };
};

/**
 * Determina el nivel de prioridad para un grupo muscular
 * Enfocado principalmente en el balance de volumen, con factores secundarios
 */
const determinePriorityLevel = (
  deviation: number,
  weeklyFrequency: number,
  progressTrend: 'improving' | 'stable' | 'declining',
  isBalanced: boolean
): 'low' | 'medium' | 'high' | 'critical' => {
  // Si está balanceado, prioridad máxima es 'medium' (solo por factores secundarios)
  if (isBalanced) {
    if (weeklyFrequency < 1) return 'medium'; // Frecuencia muy baja
    if (progressTrend === 'declining') return 'medium'; // Tendencia negativa
    return 'low'; // Bien balanceado y sin problemas
  }

  // Si no está balanceado, prioridad basada en desviación
  if (Math.abs(deviation) > 15) return 'critical';
  if (Math.abs(deviation) > 10) return 'high';
  if (Math.abs(deviation) > 5) return 'medium';

  // Casos edge: frecuencia muy baja o tendencia muy negativa
  if (weeklyFrequency < 1) return 'critical';
  if (progressTrend === 'declining' && Math.abs(deviation) > 3) return 'high';

  return 'low';
};

/**
 * Determina la etapa de desarrollo para un grupo muscular
 */
const determineDevelopmentStage = (
  strengthIndex: number,
  weeklyFrequency: number,
  volume: number
): 'beginner' | 'intermediate' | 'advanced' | 'neglected' => {
  if (volume === 0 || weeklyFrequency < 0.5) return 'neglected';
  if (strengthIndex < 30) return 'beginner';
  if (strengthIndex < 70) return 'intermediate';
  return 'advanced';
};

/**
 * Analiza el historial de balance para un grupo muscular
 * Corregido para usar 1RM estimado en lugar de volumen bruto
 */
const analyzeBalanceHistory = (categoryRecords: WorkoutRecord[]): {
  trend: 'improving' | 'stable' | 'declining';
  consistency: number;
  volatility: number;
} => {
  if (categoryRecords.length < 3) {
    return { trend: 'stable', consistency: 0, volatility: 0 };
  }

  // Analizar 1RM promedio semanal usando date-fns con locale español
  const sortedRecords = [...categoryRecords].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Agrupar por semana usando startOfWeek con locale español
  const weeklyData: Record<string, { total1RM: number; count: number }> = {};
  sortedRecords.forEach(record => {
    const recordDate = new Date(record.date);
    const weekStart = startOfWeek(recordDate, { locale: es });
    const weekKey = weekStart.toISOString().split('T')[0]; // YYYY-MM-DD del lunes
    const oneRM = record.weight * (1 + Math.min(record.reps, 20) / 30);

    if (!weeklyData[weekKey]) {
      weeklyData[weekKey] = { total1RM: 0, count: 0 };
    }
    weeklyData[weekKey].total1RM += oneRM;
    weeklyData[weekKey].count += 1;
  });

  // Calcular 1RM promedio por semana
  const weekly1RMValues = Object.values(weeklyData).map(week =>
    week.count > 0 ? week.total1RM / week.count : 0
  );

  // Calcular tendencia usando primera mitad vs segunda mitad
  const midpoint = Math.floor(weekly1RMValues.length / 2);
  const firstHalf = weekly1RMValues.slice(0, midpoint);
  const secondHalf = weekly1RMValues.slice(midpoint);

  const firstAvg = firstHalf.length > 0 ? firstHalf.reduce((sum, v) => sum + v, 0) / firstHalf.length : 0;
  const secondAvg = secondHalf.length > 0 ? secondHalf.reduce((sum, v) => sum + v, 0) / secondHalf.length : 0;

  const trendChange = firstAvg > 0 ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0;

  let trend: 'improving' | 'stable' | 'declining';
  if (trendChange > 5) trend = 'improving';
  else if (trendChange < -5) trend = 'declining';
  else trend = 'stable';

  // Calcular consistencia (inverso del coeficiente de variación)
  const mean = weekly1RMValues.reduce((sum, v) => sum + v, 0) / weekly1RMValues.length;
  const variance = weekly1RMValues.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / weekly1RMValues.length;
  const stdDev = Math.sqrt(variance);
  const consistency = mean > 0 ? Math.max(0, 100 - ((stdDev / mean) * 100)) : 0;

  // Calcular volatilidad
  const volatility = mean > 0 ? (stdDev / mean) * 100 : 0;

  return {
    trend,
    consistency: Math.round(consistency),
    volatility: Math.round(volatility)
  };
};

/**
 * Genera recomendaciones específicas para un grupo muscular
 */
const generateSpecificRecommendations = (
  category: string,
  balance: Partial<MuscleBalance>,
  categoryMetrics: CategoryMetrics[]
): string[] => {
  const recommendations: string[] = [];

  // Recomendaciones por desviación
  if (balance.deviation && Math.abs(balance.deviation) > 10) {
    if (balance.deviation > 0) {
      recommendations.push(`Reducir volumen de ${category.toLowerCase()} en ${Math.round(balance.deviation)}%`);
    } else {
      recommendations.push(`Aumentar volumen de ${category.toLowerCase()} en ${Math.round(Math.abs(balance.deviation))}%`);
    }
  }

  // Recomendaciones por frecuencia
  if (balance.weeklyFrequency && balance.weeklyFrequency < 2) {
    recommendations.push(`Aumentar frecuencia a 2-3 sesiones por semana`);
  } else if (balance.weeklyFrequency && balance.weeklyFrequency > 4) {
    recommendations.push(`Reducir frecuencia para mejorar recuperación`);
  }

  // Recomendaciones por tendencia
  if (balance.progressTrend === 'declining') {
    recommendations.push(`Revisar técnica y progresión en ${category.toLowerCase()}`);
  } else if (balance.progressTrend === 'stable') {
    recommendations.push(`Variar ejercicios para estimular crecimiento`);
  }

  // Recomendaciones por ratio antagonista
  if (balance.antagonistRatio && balance.antagonistRatio < 0.8) {
    recommendations.push(`Fortalecer ${category.toLowerCase()} para balancear con antagonista`);
  } else if (balance.antagonistRatio && balance.antagonistRatio > 1.2) {
    recommendations.push(`Equilibrar con más trabajo del grupo antagonista`);
  }

  // Recomendaciones por intensidad
  if (balance.intensityScore && balance.intensityScore < 70) {
    recommendations.push(`Aumentar intensidad progresivamente`);
  }

  return recommendations;
};

/**
 * Genera advertencias para un grupo muscular
 */
const generateWarnings = (
  category: string,
  balance: Partial<MuscleBalance>
): string[] => {
  const warnings: string[] = [];

  if (balance.priorityLevel === 'critical') {
    warnings.push(`${category} requiere atención inmediata`);
  }

  if (balance.developmentStage === 'neglected') {
    warnings.push(`${category} ha sido descuidado - riesgo de desequilibrio`);
  }

  if (balance.progressTrend === 'declining') {
    warnings.push(`Progreso en declive en ${category.toLowerCase()}`);
  }

  if (balance.antagonistRatio && (balance.antagonistRatio < 0.6 || balance.antagonistRatio > 1.4)) {
    warnings.push(`Desequilibrio significativo con grupo antagonista`);
  }

  if (balance.balanceHistory?.volatility && balance.balanceHistory.volatility > 50) {
    warnings.push(`Alta volatilidad en entrenamiento de ${category.toLowerCase()}`);
  }

  return warnings;
};

/**
 * Analiza el balance muscular con métricas avanzadas
 */
export const analyzeMuscleBalance = (records: WorkoutRecord[]): MuscleBalance[] => {
  if (records.length === 0) return [];

  const categoryMetrics = calculateCategoryMetrics(records);
  const totalVolume = categoryMetrics.reduce((sum, metric) => sum + metric.totalVolume, 0);

  // Calcular factor de ajuste temporal
  const temporalAdjustmentFactor = calculateTemporalAdjustmentFactor(records);

  // Volúmenes ideales por categoría (porcentajes recomendados)
  const idealDistribution: Record<string, number> = {
    'Pecho': 20,
    'Espalda': 25, // Espalda ligeramente más por balance postural
    'Piernas': 30, // Piernas más por ser el grupo muscular más grande
    'Hombros': 15,
    'Brazos': 10,
    'Core': 10,
    'Cardio': 5
  };

  // Agrupar registros por categoría para análisis detallado
  const recordsByCategory: Record<string, WorkoutRecord[]> = {};
  records.forEach(record => {
    const categories = record.exercise?.categories || [];
    if (categories.length === 0) {
      const category = 'Sin categoría';
      if (!recordsByCategory[category]) recordsByCategory[category] = [];
      recordsByCategory[category].push(record);
    } else {
      categories.forEach(category => {
        if (!recordsByCategory[category]) recordsByCategory[category] = [];
        recordsByCategory[category].push(record);
      });
    }
  });

  const muscleBalance: MuscleBalance[] = [];

  // Analizar cada categoría con métricas
  categoryMetrics.forEach(metric => {
    const actualPercentage = (metric.totalVolume / totalVolume) * 100;
    const idealPercentage = idealDistribution[metric.category] || 15;
    const deviation = actualPercentage - idealPercentage;

    // Ajustar el margen de balance según el factor temporal
    const balanceMargin = 5 + (15 * (1 - temporalAdjustmentFactor)); // Margen más amplio con menos datos
    const isBalanced = Math.abs(deviation) <= balanceMargin;

    // Obtener registros específicos para esta categoría
    const categoryRecords = recordsByCategory[metric.category] || [];

    // Calcular métricas avanzadas con ajustes
    const rawSymmetryScore = calculateSymmetryScore(metric.category, categoryRecords);
    const symmetryScore = adjustMetricsForLimitedData(rawSymmetryScore, temporalAdjustmentFactor, 'score');

    const antagonistRatio = calculateAntagonistRatio(metric.category, categoryMetrics);

    const rawStrengthIndex = calculateStrengthIndex(categoryRecords);
    const strengthIndex = adjustMetricsForLimitedData(rawStrengthIndex, temporalAdjustmentFactor, 'score');

    const progressAnalysis = analyzeProgressTrend(categoryRecords);

    const intensityScore = calculateIntensityScore(categoryRecords);

    const balanceHistory = analyzeBalanceHistory(categoryRecords);
    // Ajustar consistencia del historial
    balanceHistory.consistency = adjustMetricsForLimitedData(balanceHistory.consistency, temporalAdjustmentFactor, 'percentage');

    // Determinar características con ajustes para datos limitados
    const adjustedDeviation = deviation * temporalAdjustmentFactor; // Reducir la importancia de la desviación con pocos datos
    const priorityLevel = determinePriorityLevel(adjustedDeviation, metric.avgWorkoutsPerWeek, progressAnalysis.trend, isBalanced);
    const developmentStage = determineDevelopmentStage(strengthIndex, metric.avgWorkoutsPerWeek, metric.totalVolume);

    // Generar recomendación básica considerando el factor temporal
    let recommendation = '';
    if (temporalAdjustmentFactor < 0.5) {
      // Con muy pocos datos, dar recomendaciones más generales
      recommendation = `Continúa registrando entrenamientos de ${metric.category.toLowerCase()} para análisis más precisos`;
    } else if (actualPercentage < idealPercentage - balanceMargin) {
      recommendation = `Entrenar más ${metric.category.toLowerCase()} (+${Math.round(Math.abs(deviation))}%)`;
    } else if (actualPercentage > idealPercentage + balanceMargin) {
      recommendation = `Reducir volumen de ${metric.category.toLowerCase()} (-${Math.round(deviation)}%)`;
    } else {
      recommendation = `Balance adecuado en ${metric.category.toLowerCase()}`;
    }

    // Crear objeto completo
    const balanceData: Partial<MuscleBalance> = {
      category: metric.category,
      volume: metric.totalVolume,
      percentage: Math.round(actualPercentage * 100) / 100,
      isBalanced,
      recommendation,
      idealPercentage,
      deviation: Math.round(deviation * 100) / 100,
      symmetryScore,
      antagonistRatio,
      strengthIndex,
      progressTrend: progressAnalysis.trend,
      lastImprovement: progressAnalysis.lastImprovement,
      priorityLevel,
      developmentStage,
      weeklyFrequency: metric.avgWorkoutsPerWeek,
      intensityScore,
      balanceHistory
    };

    // Generar recomendaciones específicas y advertencias
    const specificRecommendations = generateSpecificRecommendations(metric.category, balanceData, categoryMetrics);
    const warnings = generateWarnings(metric.category, balanceData);

    // Objeto final completo
    muscleBalance.push({
      ...balanceData,
      specificRecommendations,
      warnings
    } as MuscleBalance);
  });

  // Agregar categorías faltantes con valores por defecto
  EXERCISE_CATEGORIES.forEach(category => {
    if (!muscleBalance.find(balance => balance.category === category)) {
      const idealPercentage = idealDistribution[category] || 15;

      // Ajustar métricas por defecto según el factor temporal
      const adjustedSymmetryScore = adjustMetricsForLimitedData(0, temporalAdjustmentFactor, 'score');
      const adjustedStrengthIndex = adjustMetricsForLimitedData(0, temporalAdjustmentFactor, 'score');
      const adjustedIntensityScore = adjustMetricsForLimitedData(0, temporalAdjustmentFactor, 'percentage');

      const balanceData: Partial<MuscleBalance> = {
        category,
        volume: 0,
        percentage: 0,
        isBalanced: false,
        recommendation: temporalAdjustmentFactor < 0.5
          ? `Considera agregar ejercicios de ${category.toLowerCase()} cuando estés listo`
          : `Comenzar entrenamientos de ${category.toLowerCase()}`,
        idealPercentage,
        deviation: -idealPercentage,
        symmetryScore: adjustedSymmetryScore,
        antagonistRatio: 0,
        strengthIndex: adjustedStrengthIndex,
        progressTrend: 'stable',
        lastImprovement: null,
        priorityLevel: temporalAdjustmentFactor < 0.5 ? 'medium' : 'critical',
        developmentStage: 'neglected',
        weeklyFrequency: 0,
        intensityScore: adjustedIntensityScore,
        balanceHistory: {
          trend: 'stable',
          consistency: adjustMetricsForLimitedData(0, temporalAdjustmentFactor, 'percentage'),
          volatility: 0
        }
      };

      const specificRecommendations = generateSpecificRecommendations(category, balanceData, categoryMetrics);
      const warnings = temporalAdjustmentFactor < 0.5 ? [] : generateWarnings(category, balanceData);

      muscleBalance.push({
        ...balanceData,
        specificRecommendations,
        warnings
      } as MuscleBalance);
    }
  });

  return muscleBalance.sort((a, b) => b.percentage - a.percentage);
};

/**
 * Calcula el score de balance general (0-100)
 */
export const calculateBalanceScore = (muscleBalance: MuscleBalance[], records?: WorkoutRecord[]): number => {
  if (muscleBalance.length === 0) return 0;

  const balancedCategories = muscleBalance.filter(balance => balance.isBalanced).length;
  const totalCategories = muscleBalance.filter(balance => balance.volume > 0).length;

  if (totalCategories === 0) return 0;

  // Calcular score base
  const baseScore = (balancedCategories / totalCategories) * 100;

  // Si se proporcionan los records, ajustar el score según el factor temporal
  if (records && records.length > 0) {
    const temporalAdjustmentFactor = calculateTemporalAdjustmentFactor(records);

    // Con pocos datos, ser más generoso con el score
    if (temporalAdjustmentFactor < 0.7) {
      // Dar bonus por estar empezando
      const beginnerBonus = (1 - temporalAdjustmentFactor) * 20;
      return Math.min(100, Math.round(baseScore + beginnerBonus));
    }
  }

  return Math.round(baseScore);
};

/**
 * Encuentra la categoría dominante
 */
export const findDominantCategory = (categoryMetrics: CategoryMetrics[]): string | null => {
  if (categoryMetrics.length === 0) return null;

  const sorted = [...categoryMetrics].sort((a, b) => b.percentage - a.percentage);
  return sorted[0]?.category || null;
};

/**
 * Encuentra la categoría menos entrenada (con al menos 1 entrenamiento)
 */
export const findLeastTrainedCategory = (categoryMetrics: CategoryMetrics[]): string | null => {
  if (categoryMetrics.length === 0) return null;

  const sorted = [...categoryMetrics]
    .filter(metric => metric.workouts > 0)
    .sort((a, b) => a.percentage - b.percentage);

  return sorted[0]?.category || null;
};

/**
 * Calcula el análisis completo por categorías
 */
export const calculateCategoryAnalysis = (records: WorkoutRecord[]): CategoryAnalysis => {
  const categoryMetrics = calculateCategoryMetrics(records);
  const muscleBalance = analyzeMuscleBalance(records);
  const balanceScore = calculateBalanceScore(muscleBalance, records);
  const dominantCategory = findDominantCategory(categoryMetrics);
  const leastTrainedCategory = findLeastTrainedCategory(categoryMetrics);

  return {
    categoryMetrics,
    muscleBalance,
    dominantCategory,
    leastTrainedCategory,
    balanceScore
  };
}; 