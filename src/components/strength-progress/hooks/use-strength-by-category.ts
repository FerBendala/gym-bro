import { useMemo } from 'react';
import type { WorkoutRecord } from '../../../interfaces';
import { calculateAdvancedStrengthAnalysis } from '../../../utils/functions';
import type { CategoryMetrics } from '../../../utils/functions/category-analysis';

export interface StrengthByCategory {
  categoryName: string;
  categoryMetrics: CategoryMetrics;
  strengthAnalysis: ReturnType<typeof calculateAdvancedStrengthAnalysis>;
  strengthScore: number; // 0-100
  strengthRank: number;
  recommendations: string[];
}

export interface StrengthCategoryComparison {
  categories: StrengthByCategory[];
  bestCategory: StrengthByCategory | null;
  worstCategory: StrengthByCategory | null;
  totalStrengthScore: number;
  balanceScore: number; // qué tan equilibrado es el desarrollo
  focusRecommendations: string[];
}

/**
 * Calcula métricas básicas para una categoría específica
 */
const calculateSingleCategoryMetrics = (categoryName: string, categoryRecords: WorkoutRecord[]): CategoryMetrics => {
  if (categoryRecords.length === 0) {
    return {
      category: categoryName,
      workouts: 0,
      totalVolume: 0,
      avgWeight: 0,
      maxWeight: 0,
      minWeight: 0,
      avgSets: 0,
      avgReps: 0,
      totalSets: 0,
      totalReps: 0,
      avgWorkoutsPerWeek: 0,
      lastWorkout: null,
      percentage: 0,
      personalRecords: 0,
      estimatedOneRM: 0,
      weightProgression: 0,
      volumeProgression: 0,
      intensityScore: 0,
      efficiencyScore: 0,
      consistencyScore: 0,
      daysSinceLastWorkout: 0,
      trend: 'stable',
      strengthLevel: 'beginner',
      volumeDistribution: {
        thisWeek: 0,
        lastWeek: 0,
        thisMonth: 0,
        lastMonth: 0
      },
      performanceMetrics: {
        bestSession: {
          date: new Date(),
          volume: 0,
          maxWeight: 0
        },
        averageSessionVolume: 0,
        volumePerWorkout: 0,
        sessionsAboveAverage: 0
      },
      recommendations: [],
      warnings: []
    };
  }

  const workouts = categoryRecords.length;
  const totalVolume = categoryRecords.reduce((sum, record) => sum + (record.weight * record.reps * record.sets), 0);

  // Calcular métricas de peso
  const weights = categoryRecords.map(record => record.weight);
  const avgWeight = weights.reduce((sum, weight) => sum + weight, 0) / weights.length;
  const maxWeight = Math.max(...weights);
  const minWeight = Math.min(...weights);

  // Calcular métricas de sets y reps
  const sets = categoryRecords.map(record => record.sets);
  const reps = categoryRecords.map(record => record.reps);
  const avgSets = sets.reduce((sum, s) => sum + s, 0) / sets.length;
  const avgReps = reps.reduce((sum, r) => sum + r, 0) / reps.length;
  const totalSets = sets.reduce((sum, s) => sum + s, 0);
  const totalReps = reps.reduce((sum, r) => sum + r, 0);

  // Calcular frecuencia semanal
  const dates = categoryRecords.map(record => new Date(record.date));
  const earliestDate = new Date(Math.min(...dates.map(d => d.getTime())));
  const latestDate = new Date(Math.max(...dates.map(d => d.getTime())));
  const daysDifference = Math.max(1, Math.ceil((latestDate.getTime() - earliestDate.getTime()) / (1000 * 60 * 60 * 24)));
  const avgWorkoutsPerWeek = (workouts / daysDifference) * 7;

  const lastWorkout = latestDate;
  const daysSinceLastWorkout = Math.floor((new Date().getTime() - lastWorkout.getTime()) / (1000 * 60 * 60 * 24));

  // Calcular 1RM estimado
  const estimatedOneRM = Math.max(...categoryRecords.map(r => r.weight * (1 + Math.min(r.reps, 20) / 30)));

  // Calcular métricas básicas adicionales
  const personalRecords = 1; // Simplificado
  const intensityScore = maxWeight > 0 ? Math.round((avgWeight / maxWeight) * 100) : 0;
  const efficiencyScore = workouts > 0 ? Math.round(totalVolume / workouts) : 0;
  const consistencyScore = avgWorkoutsPerWeek > 0 ? Math.min(100, Math.round(avgWorkoutsPerWeek * 25)) : 0;

  // Determinar tendencia simplificada
  const trend: 'improving' | 'stable' | 'declining' = 'stable'; // Simplificado

  // Determinar nivel de fuerza
  const strengthLevel: 'beginner' | 'intermediate' | 'advanced' =
    estimatedOneRM < 50 ? 'beginner' :
      estimatedOneRM < 100 ? 'intermediate' : 'advanced';

  return {
    category: categoryName,
    workouts,
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
    percentage: 0, // Se calculará después
    personalRecords,
    estimatedOneRM: Math.round(estimatedOneRM),
    weightProgression: 0, // Simplificado
    volumeProgression: 0, // Simplificado
    intensityScore,
    efficiencyScore,
    consistencyScore,
    daysSinceLastWorkout,
    trend,
    strengthLevel,
    volumeDistribution: {
      thisWeek: 0,
      lastWeek: 0,
      thisMonth: 0,
      lastMonth: 0
    },
    performanceMetrics: {
      bestSession: {
        date: lastWorkout,
        volume: Math.max(...categoryRecords.map(r => r.weight * r.reps * r.sets)),
        maxWeight
      },
      averageSessionVolume: Math.round(totalVolume / workouts),
      volumePerWorkout: Math.round(totalVolume / workouts),
      sessionsAboveAverage: 0
    },
    recommendations: [],
    warnings: []
  };
};

/**
 * Hook para análisis de fuerza integrado con categorías
 */
export const useStrengthByCategory = (records: WorkoutRecord[]): StrengthCategoryComparison => {
  return useMemo(() => {
    if (records.length === 0) {
      return {
        categories: [],
        bestCategory: null,
        worstCategory: null,
        totalStrengthScore: 0,
        balanceScore: 0,
        focusRecommendations: ['Registra entrenamientos para ver el análisis por categorías']
      };
    }

    // Agrupar registros por categoría
    const recordsByCategory = records.reduce((acc, record) => {
      const categories = record.exercise?.categories || ['Sin categoría'];

      categories.forEach(category => {
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(record);
      });

      return acc;
    }, {} as Record<string, WorkoutRecord[]>);

    // Calcular análisis por categoría
    const categories: StrengthByCategory[] = Object.entries(recordsByCategory).map(([categoryName, categoryRecords]) => {
      // Calcular métricas de categoría básicas
      const categoryMetrics = calculateSingleCategoryMetrics(categoryName, categoryRecords);

      // Calcular análisis de fuerza específico para esta categoría
      const strengthAnalysis = calculateAdvancedStrengthAnalysis(categoryRecords);

      // Calcular puntuación de fuerza para esta categoría
      const strengthScore = calculateCategoryStrengthScore(strengthAnalysis, categoryMetrics);

      // Generar recomendaciones específicas para esta categoría
      const recommendations = generateCategoryRecommendations(strengthAnalysis, categoryMetrics, categoryName);

      return {
        categoryName,
        categoryMetrics,
        strengthAnalysis,
        strengthScore,
        strengthRank: 0, // Se calculará después
        recommendations
      };
    });

    // Ordenar por puntuación de fuerza y asignar ranks
    const sortedCategories = categories.sort((a, b) => b.strengthScore - a.strengthScore);
    sortedCategories.forEach((category, index) => {
      category.strengthRank = index + 1;
    });

    // Identificar mejor y peor categoría
    const bestCategory = sortedCategories[0] || null;
    const worstCategory = sortedCategories[sortedCategories.length - 1] || null;

    // Calcular puntuación total de fuerza
    const totalStrengthScore = categories.length > 0
      ? categories.reduce((sum, cat) => sum + cat.strengthScore, 0) / categories.length
      : 0;

    // Calcular balance score (qué tan equilibrado es el desarrollo)
    const balanceScore = calculateBalanceScore(categories);

    // Generar recomendaciones de enfoque
    const focusRecommendations = generateFocusRecommendations(categories, balanceScore);

    return {
      categories: sortedCategories,
      bestCategory,
      worstCategory,
      totalStrengthScore: Math.round(totalStrengthScore),
      balanceScore: Math.round(balanceScore),
      focusRecommendations
    };
  }, [records]);
};

/**
 * Calcula puntuación de fuerza para una categoría específica
 */
const calculateCategoryStrengthScore = (
  strengthAnalysis: ReturnType<typeof calculateAdvancedStrengthAnalysis>,
  categoryMetrics: CategoryMetrics
): number => {
  // Factores de puntuación con pesos específicos
  const factors = {
    // Progreso general (30%)
    progressRate: Math.min(100, Math.max(0, strengthAnalysis.overallProgress.percentage)) * 0.3,

    // Consistencia (25%)
    consistency: strengthAnalysis.consistencyMetrics.progressionConsistency * 0.25,

    // Volumen y frecuencia (20%)
    volume: Math.min(100, (categoryMetrics.totalVolume / 1000) * 10) * 0.2,

    // Calidad del entrenamiento (15%)
    quality: (strengthAnalysis.qualityMetrics.formConsistency +
      strengthAnalysis.qualityMetrics.loadProgression +
      strengthAnalysis.qualityMetrics.volumeOptimization) / 3 * 0.15,

    // Potencial vs actual (10%)
    potential: strengthAnalysis.strengthCurve.potential * 0.1
  };

  return Math.round(Object.values(factors).reduce((sum, factor) => sum + factor, 0));
};

/**
 * Genera recomendaciones específicas para una categoría
 */
const generateCategoryRecommendations = (
  strengthAnalysis: ReturnType<typeof calculateAdvancedStrengthAnalysis>,
  categoryMetrics: CategoryMetrics,
  categoryName: string
): string[] => {
  const recommendations: string[] = [];

  // Recomendaciones basadas en progreso
  if (strengthAnalysis.overallProgress.rate === 'slow') {
    recommendations.push(`Aumenta la frecuencia de entrenamiento para ${categoryName}`);
  } else if (strengthAnalysis.overallProgress.rate === 'exceptional') {
    recommendations.push(`Mantén la excelente progresión en ${categoryName}`);
  }

  // Recomendaciones basadas en consistencia
  if (strengthAnalysis.consistencyMetrics.progressionConsistency < 60) {
    recommendations.push(`Mejora la consistencia en ${categoryName} con cargas más estables`);
  }

  // Recomendaciones basadas en predicciones
  if (strengthAnalysis.predictions.plateauRisk > 70) {
    recommendations.push(`Riesgo de meseta en ${categoryName} - introduce variaciones`);
  }

  // Recomendaciones basadas en fase de entrenamiento
  if (strengthAnalysis.strengthCurve.phase === 'novice') {
    recommendations.push(`Enfócate en progresión lineal en ${categoryName}`);
  } else if (strengthAnalysis.strengthCurve.phase === 'advanced') {
    recommendations.push(`Usa periodización avanzada para ${categoryName}`);
  }

  // Recomendaciones basadas en calidad
  if (strengthAnalysis.qualityMetrics.formConsistency < 70) {
    recommendations.push(`Mejora la técnica en ejercicios de ${categoryName}`);
  }

  // Recomendaciones basadas en volume
  if (categoryMetrics.totalVolume < 500) {
    recommendations.push(`Aumenta el volumen de entrenamiento para ${categoryName}`);
  }

  // Recomendaciones basadas en rangos de repeticiones
  const lowRepWork = strengthAnalysis.repRangeAnalysis.find(r => r.range.includes('1-3'));
  const highRepWork = strengthAnalysis.repRangeAnalysis.find(r => r.range.includes('11-15'));

  if (!lowRepWork && categoryName.toLowerCase().includes('fuerza')) {
    recommendations.push(`Incluye trabajo de fuerza máxima (1-3 reps) en ${categoryName}`);
  }

  if (!highRepWork && categoryName.toLowerCase().includes('hipertrofia')) {
    recommendations.push(`Incluye trabajo de hipertrofia (11-15 reps) en ${categoryName}`);
  }

  return recommendations.slice(0, 3); // Limitar a 3 recomendaciones más importantes
};

/**
 * Calcula qué tan equilibrado es el desarrollo entre categorías
 */
const calculateBalanceScore = (categories: StrengthByCategory[]): number => {
  if (categories.length < 2) return 100;

  const scores = categories.map(cat => cat.strengthScore);
  const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;

  // Calcular desviación estándar
  const variance = scores.reduce((sum, score) => sum + Math.pow(score - average, 2), 0) / scores.length;
  const standardDeviation = Math.sqrt(variance);

  // Convertir a puntuación de balance (menor desviación = mejor balance)
  // Desviación de 0 = 100, desviación de 30+ = 0
  const balanceScore = Math.max(0, 100 - (standardDeviation * 3.33));

  return balanceScore;
};

/**
 * Genera recomendaciones de enfoque generales
 */
const generateFocusRecommendations = (
  categories: StrengthByCategory[],
  balanceScore: number
): string[] => {
  const recommendations: string[] = [];

  if (categories.length === 0) {
    return ['Registra entrenamientos para obtener recomendaciones'];
  }

  // Recomendaciones basadas en balance
  if (balanceScore < 50) {
    const bestCategory = categories.find(cat => cat.strengthRank === 1);
    const worstCategory = categories.find(cat => cat.strengthRank === categories.length);

    if (bestCategory && worstCategory) {
      recommendations.push(
        `Desarrollo desbalanceado: enfócate más en ${worstCategory.categoryName} vs ${bestCategory.categoryName}`
      );
    }
  } else if (balanceScore > 80) {
    recommendations.push('Excelente balance entre categorías - mantén la diversidad');
  }

  // Recomendaciones basadas en categorías específicas
  const weakCategories = categories.filter(cat => cat.strengthScore < 60);
  if (weakCategories.length > 0) {
    recommendations.push(
      `Prioriza: ${weakCategories.map(cat => cat.categoryName).join(', ')}`
    );
  }

  const strongCategories = categories.filter(cat => cat.strengthScore > 80);
  if (strongCategories.length > 0) {
    recommendations.push(
      `Mantén el nivel en: ${strongCategories.map(cat => cat.categoryName).join(', ')}`
    );
  }

  // Recomendaciones basadas en fases de entrenamiento
  const noviceCategories = categories.filter(cat => cat.strengthAnalysis.strengthCurve.phase === 'novice');
  if (noviceCategories.length > 0) {
    recommendations.push(
      `Progresión lineal recomendada para: ${noviceCategories.map(cat => cat.categoryName).join(', ')}`
    );
  }

  const advancedCategories = categories.filter(cat => cat.strengthAnalysis.strengthCurve.phase === 'advanced');
  if (advancedCategories.length > 0) {
    recommendations.push(
      `Periodización avanzada para: ${advancedCategories.map(cat => cat.categoryName).join(', ')}`
    );
  }

  return recommendations.slice(0, 4); // Limitar a 4 recomendaciones más importantes
}; 