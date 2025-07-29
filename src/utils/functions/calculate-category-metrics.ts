import type { ExerciseAssignment, WorkoutRecord } from '@/interfaces';
import { calculateCategoryPerformanceMetrics } from './calculate-category-performance-metrics';
import { calculateConsistencyScore } from './calculate-consistency-score';
import { calculateIntensityScore } from './calculate-intensity-score';
import { calculateVolumeDistribution } from './calculate-volume-distribution';
import { calculateVolumeProgression } from './calculate-volume-progression';
import { calculateWeightProgression } from './calculate-weight-progression';
import type { CategoryMetrics } from './category-analysis-types';
import { calculateEfficiencyScore, calculatePersonalRecords } from './category-metrics-calculations';
import { generateCategoryRecommendations, generateCategoryWarnings } from './generate-category-recommendations';
import { getCurrentDateFromRecords } from './get-current-date-from-records';
import { roundToDecimals } from './math-utils';
import { calculateVolume } from './volume-calculations';
import { getLatestDate, getMaxEstimated1RM } from './workout-utils';

/**
 * Calcula métricas detalladas para cada categoría de ejercicios
 * Refactorizado para usar funciones centralizadas y eliminar redundancias
 */
export const calculateCategoryMetrics = (records: WorkoutRecord[], allAssignments?: ExerciseAssignment[]): CategoryMetrics[] => {
  if (records.length === 0) return [];

  // Agrupar registros por categoría
  const recordsByCategory: { [key: string]: WorkoutRecord[] } = {};
  const workoutsByCategory: { [key: string]: number } = {};
  const volumeByCategory: { [key: string]: number } = {};

  records.forEach(record => {
    const categories = record.exercise?.categories || [];

    categories.forEach(category => {
      if (!recordsByCategory[category]) {
        recordsByCategory[category] = [];
        workoutsByCategory[category] = 0;
        volumeByCategory[category] = 0;
      }

      recordsByCategory[category].push(record);
      workoutsByCategory[category]++;
      // Usar función centralizada para calcular volumen
      volumeByCategory[category] += calculateVolume(record);
    });
  });

  // Calcular volumen total usando función centralizada
  const totalVolume = Object.values(volumeByCategory).reduce((sum, volume) => sum + volume, 0);

  // Obtener fecha actual basada en los datos
  const currentDate = getCurrentDateFromRecords(records);

  // Array para almacenar las métricas de categorías
  const categoryMetricsArray: CategoryMetrics[] = [];

  // Calcular métricas para cada categoría
  Object.entries(recordsByCategory).forEach(([category, categoryRecords]) => {
    const workouts = workoutsByCategory[category];
    const categoryVolume = volumeByCategory[category];

    // Calcular pesos promedio, máximo y mínimo usando funciones centralizadas
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

    // MEJORADO: Calcular frecuencia reconociendo mejoras recientes
    let avgWorkoutsPerWeek = 0;
    let recentImprovement = false; // Declarar en el ámbito correcto

    if (weeklyData.size > 0) {
      // Frecuencia histórica promedio
      const historicalAvg = Array.from(weeklyData.values()).reduce((sum, daysSet) => sum + daysSet.size, 0) / weeklyData.size;

      // Lógica de detección de mejoras adaptada al número de semanas
      const sortedWeeks = Array.from(weeklyData.entries())
        .sort(([a], [b]) => a.localeCompare(b));

      if (weeklyData.size >= 2) {
        // Con 2+ semanas, comparar período reciente vs anterior
        if (weeklyData.size >= 4) {
          // Con 4+ semanas: comparar últimas 2 vs anteriores
          const recentWeeks = sortedWeeks.slice(-2);
          const olderWeeks = sortedWeeks.slice(0, -2);

          const recentAvg = recentWeeks.reduce((sum, [, daysSet]) => sum + daysSet.size, 0) / recentWeeks.length;
          const olderAvg = olderWeeks.reduce((sum, [, daysSet]) => sum + daysSet.size, 0) / olderWeeks.length;

          if (recentAvg > olderAvg * 1.4) { // 40% mejora
            recentImprovement = true;
            avgWorkoutsPerWeek = (recentAvg * 0.7) + (historicalAvg * 0.3);
          } else {
            avgWorkoutsPerWeek = historicalAvg;
          }
        } else {
          // Con 2-3 semanas: comparar última semana vs anteriores
          const lastWeek = sortedWeeks[sortedWeeks.length - 1];
          const previousWeeks = sortedWeeks.slice(0, -1);

          const lastWeekFreq = lastWeek[1].size;
          const previousAvg = previousWeeks.reduce((sum, [, daysSet]) => sum + daysSet.size, 0) / previousWeeks.length;

          // Con pocas semanas, ser más liberal: 50% mejora
          if (lastWeekFreq > previousAvg * 1.5 && lastWeekFreq >= 2) {
            recentImprovement = true;
            // Dar más peso a la mejora reciente
            avgWorkoutsPerWeek = (lastWeekFreq * 0.6) + (historicalAvg * 0.4);
          } else {
            avgWorkoutsPerWeek = historicalAvg;
          }
        }
      } else {
        avgWorkoutsPerWeek = historicalAvg;
      }
    }

    const lastWorkout = getLatestDate(categoryRecords);

    // Usar porcentaje de volumen relativo al esfuerzo
    const percentage = totalVolume > 0 ? (categoryVolume / totalVolume) * 100 : 0;

    // Calcular métricas avanzadas usando funciones centralizadas
    const personalRecords = calculatePersonalRecords(categoryRecords);
    const estimatedOneRM = getMaxEstimated1RM(categoryRecords);

    const weightProgression = calculateWeightProgression(categoryRecords, category);
    const volumeProgression = calculateVolumeProgression(categoryRecords, category);
    const intensityScore = calculateIntensityScore(categoryRecords);
    const efficiencyScore = calculateEfficiencyScore(categoryRecords);
    const consistencyScore = calculateConsistencyScore(categoryRecords, avgWorkoutsPerWeek);

    // Usar fecha actual basada en los datos reales en lugar de new Date()
    const daysSinceLastWorkout = Math.floor((currentDate.getTime() - lastWorkout.getTime()) / (1000 * 60 * 60 * 24));

    let trend: 'improving' | 'stable' | 'declining' = 'stable';

    // Determinar tendencia basada en progresión de peso y volumen
    if (weightProgression > 5 || volumeProgression > 10) {
      trend = 'improving';
    } else if (weightProgression < -5 || volumeProgression < -10) {
      trend = 'declining';
    }

    // Determinar nivel de fuerza basado en 1RM estimado
    let strengthLevel: 'beginner' | 'intermediate' | 'advanced' = 'beginner';
    if (estimatedOneRM > 100) strengthLevel = 'advanced';
    else if (estimatedOneRM > 50) strengthLevel = 'intermediate';

    // Calcular distribución de volumen usando función centralizada
    const volumeDistribution = calculateVolumeDistribution(categoryRecords, records, allAssignments);

    // Calcular métricas de rendimiento usando función centralizada
    const performanceMetrics = calculateCategoryPerformanceMetrics(categoryRecords);

    // Generar recomendaciones y advertencias
    const recommendations = generateCategoryRecommendations(category, {
      workouts,
      totalVolume: categoryVolume,
      avgWeight,
      maxWeight,
      avgWorkoutsPerWeek,
      trend,
      strengthLevel,
      daysSinceLastWorkout
    });

    const warnings = generateCategoryWarnings(category, {
      workouts,
      totalVolume: categoryVolume,
      avgWeight,
      maxWeight,
      avgWorkoutsPerWeek,
      trend,
      strengthLevel,
      daysSinceLastWorkout
    });

    // Crear objeto de métricas con valores redondeados usando función centralizada
    const categoryMetrics: CategoryMetrics = {
      category,
      workouts,
      totalVolume: roundToDecimals(categoryVolume),
      avgWeight: roundToDecimals(avgWeight, 2),
      maxWeight,
      minWeight,
      avgWorkoutsPerWeek: roundToDecimals(avgWorkoutsPerWeek, 2),
      lastWorkout,
      percentage: roundToDecimals(percentage, 1),
      avgSets: roundToDecimals(avgSets, 2),
      avgReps: roundToDecimals(avgReps, 2),
      totalSets,
      totalReps,
      personalRecords,
      estimatedOneRM: roundToDecimals(estimatedOneRM),
      weightProgression: roundToDecimals(weightProgression, 1),
      volumeProgression: roundToDecimals(volumeProgression, 1),
      intensityScore: roundToDecimals(intensityScore),
      efficiencyScore: roundToDecimals(efficiencyScore),
      consistencyScore: roundToDecimals(consistencyScore),
      daysSinceLastWorkout,
      trend,
      strengthLevel,
      recentImprovement,
      volumeDistribution: {
        thisWeek: volumeDistribution.thisWeek,
        lastWeek: volumeDistribution.lastWeek,
        thisMonth: volumeDistribution.thisMonth,
        lastMonth: volumeDistribution.lastMonth,
      },
      performanceMetrics,
      recommendations,
      warnings
    };

    categoryMetricsArray.push(categoryMetrics);
  });

  return categoryMetricsArray.sort((a: CategoryMetrics, b: CategoryMetrics) => b.totalVolume - a.totalVolume);
}; 