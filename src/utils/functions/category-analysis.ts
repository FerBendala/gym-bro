import { EXERCISE_CATEGORIES } from '../../constants/exercise-categories';
import type { WorkoutRecord } from '../../interfaces';

/**
 * Interfaz para métricas por categoría
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
 * Calcula métricas por categoría de ejercicio
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

  // Calcular métricas para cada categoría
  Object.entries(recordsByCategory).forEach(([category, categoryRecords]) => {
    const workouts = workoutsByCategory[category];
    const totalVolume = volumeByCategory[category];

    // Calcular pesos promedio y máximo considerando todos los ejercicios de la categoría
    const weights = categoryRecords.map(record => record.weight);
    const avgWeight = weights.reduce((sum, weight) => sum + weight, 0) / weights.length;
    const maxWeight = Math.max(...weights);

    // Calcular entrenamientos por semana aproximado
    const dates = categoryRecords.map(record => new Date(record.date));
    const uniqueDates = [...new Set(dates.map(d => d.toDateString()))];
    const earliestDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const latestDate = new Date(Math.max(...dates.map(d => d.getTime())));
    const daysDifference = Math.max(1, Math.ceil((latestDate.getTime() - earliestDate.getTime()) / (1000 * 60 * 60 * 24)));
    const avgWorkoutsPerWeek = (workouts / daysDifference) * 7;

    const lastWorkout = new Date(Math.max(...dates.map(d => d.getTime())));
    const percentage = (workouts / totalWorkouts) * 100;

    metrics.push({
      category,
      workouts: Math.round(workouts * 100) / 100,
      totalVolume: Math.round(totalVolume),
      avgWeight: Math.round(avgWeight * 100) / 100,
      maxWeight,
      avgWorkoutsPerWeek: Math.round(avgWorkoutsPerWeek * 100) / 100,
      lastWorkout,
      percentage: Math.round(percentage * 100) / 100
    });
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
 * Analiza la tendencia de progreso para un grupo muscular
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

  // Analizar últimas 4 semanas
  const recentRecords = sortedRecords.slice(-8); // Últimos 8 records
  const midpoint = Math.floor(recentRecords.length / 2);
  const firstHalf = recentRecords.slice(0, midpoint);
  const secondHalf = recentRecords.slice(midpoint);

  // Calcular volumen promedio para cada mitad
  const firstHalfVolume = firstHalf.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0) / firstHalf.length;
  const secondHalfVolume = secondHalf.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0) / secondHalf.length;

  const improvement = ((secondHalfVolume - firstHalfVolume) / firstHalfVolume) * 100;

  let trend: 'improving' | 'stable' | 'declining';
  if (improvement > 5) trend = 'improving';
  else if (improvement < -5) trend = 'declining';
  else trend = 'stable';

  // Encontrar último record con mejora significativa
  let lastImprovement: Date | null = null;
  for (let i = 1; i < sortedRecords.length; i++) {
    const current = sortedRecords[i];
    const previous = sortedRecords[i - 1];

    const currentVolume = current.weight * current.reps * current.sets;
    const previousVolume = previous.weight * previous.reps * previous.sets;

    if (currentVolume > previousVolume * 1.1) { // Mejora del 10%
      lastImprovement = new Date(current.date);
    }
  }

  return { trend, lastImprovement };
};

/**
 * Determina el nivel de prioridad para un grupo muscular
 */
const determinePriorityLevel = (
  deviation: number,
  weeklyFrequency: number,
  progressTrend: 'improving' | 'stable' | 'declining'
): 'low' | 'medium' | 'high' | 'critical' => {
  if (Math.abs(deviation) > 15 || weeklyFrequency < 1) return 'critical';
  if (Math.abs(deviation) > 10 || progressTrend === 'declining') return 'high';
  if (Math.abs(deviation) > 5 || weeklyFrequency < 2) return 'medium';
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
 * Calcula el score de intensidad para un grupo muscular
 */
const calculateIntensityScore = (categoryRecords: WorkoutRecord[]): number => {
  if (categoryRecords.length === 0) return 0;

  // Calcular intensidad basada en % de 1RM promedio
  const weights = categoryRecords.map(r => r.weight);
  const maxWeight = Math.max(...weights);
  const avgWeight = weights.reduce((sum, w) => sum + w, 0) / weights.length;

  if (maxWeight === 0) return 0;

  const intensityPercentage = (avgWeight / maxWeight) * 100;
  return Math.round(intensityPercentage);
};

/**
 * Analiza el historial de balance para un grupo muscular
 */
const analyzeBalanceHistory = (categoryRecords: WorkoutRecord[]): {
  trend: 'improving' | 'stable' | 'declining';
  consistency: number;
  volatility: number;
} => {
  if (categoryRecords.length < 3) {
    return { trend: 'stable', consistency: 0, volatility: 0 };
  }

  // Analizar volumen semanal
  const weeklyVolumes: { week: string; volume: number }[] = [];
  const sortedRecords = [...categoryRecords].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Agrupar por semana
  const weeklyData: Record<string, number> = {};
  sortedRecords.forEach(record => {
    const week = new Date(record.date).toISOString().slice(0, 10); // YYYY-MM-DD
    const volume = record.weight * record.reps * record.sets;
    weeklyData[week] = (weeklyData[week] || 0) + volume;
  });

  const volumes = Object.values(weeklyData);

  // Calcular tendencia
  const firstHalf = volumes.slice(0, Math.floor(volumes.length / 2));
  const secondHalf = volumes.slice(Math.floor(volumes.length / 2));

  const firstAvg = firstHalf.reduce((sum, v) => sum + v, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, v) => sum + v, 0) / secondHalf.length;

  const trendChange = ((secondAvg - firstAvg) / firstAvg) * 100;

  let trend: 'improving' | 'stable' | 'declining';
  if (trendChange > 10) trend = 'improving';
  else if (trendChange < -10) trend = 'declining';
  else trend = 'stable';

  // Calcular consistencia (inverso del coeficiente de variación)
  const mean = volumes.reduce((sum, v) => sum + v, 0) / volumes.length;
  const variance = volumes.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / volumes.length;
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
    const isBalanced = Math.abs(deviation) <= 5; // Margen de 5%

    // Obtener registros específicos para esta categoría
    const categoryRecords = recordsByCategory[metric.category] || [];

    // Calcular métricas avanzadas
    const symmetryScore = calculateSymmetryScore(metric.category, categoryRecords);
    const antagonistRatio = calculateAntagonistRatio(metric.category, categoryMetrics);
    const strengthIndex = calculateStrengthIndex(categoryRecords);
    const progressAnalysis = analyzeProgressTrend(categoryRecords);
    const intensityScore = calculateIntensityScore(categoryRecords);
    const balanceHistory = analyzeBalanceHistory(categoryRecords);

    // Determinar características
    const priorityLevel = determinePriorityLevel(deviation, metric.avgWorkoutsPerWeek, progressAnalysis.trend);
    const developmentStage = determineDevelopmentStage(strengthIndex, metric.avgWorkoutsPerWeek, metric.totalVolume);

    // Generar recomendación básica
    let recommendation = '';
    if (actualPercentage < idealPercentage - 5) {
      recommendation = `Entrenar más ${metric.category.toLowerCase()} (+${Math.round(Math.abs(deviation))}%)`;
    } else if (actualPercentage > idealPercentage + 5) {
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
      const balanceData: Partial<MuscleBalance> = {
        category,
        volume: 0,
        percentage: 0,
        isBalanced: false,
        recommendation: `Comenzar entrenamientos de ${category.toLowerCase()}`,
        idealPercentage,
        deviation: -idealPercentage,
        symmetryScore: 0,
        antagonistRatio: 0,
        strengthIndex: 0,
        progressTrend: 'stable',
        lastImprovement: null,
        priorityLevel: 'critical',
        developmentStage: 'neglected',
        weeklyFrequency: 0,
        intensityScore: 0,
        balanceHistory: {
          trend: 'stable',
          consistency: 0,
          volatility: 0
        }
      };

      const specificRecommendations = generateSpecificRecommendations(category, balanceData, categoryMetrics);
      const warnings = generateWarnings(category, balanceData);

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
export const calculateBalanceScore = (muscleBalance: MuscleBalance[]): number => {
  if (muscleBalance.length === 0) return 0;

  const balancedCategories = muscleBalance.filter(balance => balance.isBalanced).length;
  const totalCategories = muscleBalance.filter(balance => balance.volume > 0).length;

  if (totalCategories === 0) return 0;

  return Math.round((balancedCategories / totalCategories) * 100);
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
  const balanceScore = calculateBalanceScore(muscleBalance);
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