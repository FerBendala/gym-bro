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
 * Interfaz para balance muscular
 */
export interface MuscleBalance {
  category: string;
  volume: number;
  percentage: number;
  isBalanced: boolean;
  recommendation: string;
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
 * Analiza el balance muscular
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

  const muscleBalance: MuscleBalance[] = [];

  categoryMetrics.forEach(metric => {
    const actualPercentage = (metric.totalVolume / totalVolume) * 100;
    const idealPercentage = idealDistribution[metric.category] || 15; // 15% por defecto para categorías no definidas

    const difference = Math.abs(actualPercentage - idealPercentage);
    const isBalanced = difference <= 5; // Margen de 5%

    let recommendation = '';
    if (actualPercentage < idealPercentage - 5) {
      recommendation = `Entrenar más ${metric.category.toLowerCase()} (+${Math.round(idealPercentage - actualPercentage)}%)`;
    } else if (actualPercentage > idealPercentage + 5) {
      recommendation = `Reducir volumen de ${metric.category.toLowerCase()} (-${Math.round(actualPercentage - idealPercentage)}%)`;
    } else {
      recommendation = `Balance adecuado en ${metric.category.toLowerCase()}`;
    }

    muscleBalance.push({
      category: metric.category,
      volume: metric.totalVolume,
      percentage: Math.round(actualPercentage * 100) / 100,
      isBalanced,
      recommendation
    });
  });

  // Agregar categorías faltantes con 0%
  EXERCISE_CATEGORIES.forEach(category => {
    if (!muscleBalance.find(balance => balance.category === category)) {
      const idealPercentage = idealDistribution[category] || 15;
      muscleBalance.push({
        category,
        volume: 0,
        percentage: 0,
        isBalanced: false,
        recommendation: `Comenzar entrenamientos de ${category.toLowerCase()}`
      });
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