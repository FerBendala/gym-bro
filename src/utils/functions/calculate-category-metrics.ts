import type { ExerciseAssignment, WorkoutRecord } from '@/interfaces';
import { calculateVolumeProgression } from './calculate-volume-progression';
import { calculateWeightProgression } from './calculate-weight-progression';
import type { CategoryMetrics } from './category-analysis-types';
import { calculateCategoryEffortDistribution } from './exercise-patterns';
import {
  analyzeBalanceHistory,
  calculateCategoryPerformanceMetrics,
  calculateConsistencyScore,
  calculateEfficiencyScore,
  calculateIntensityScore,
  calculatePersonalRecords,
  calculateVolumeDistribution,
  determineStrengthLevel,
  generateCategoryRecommendations,
  generateCategoryWarnings,
  getCurrentDateFromRecords
} from './index';

/**
 * Calcula métricas detalladas para cada categoría muscular
 */
export const calculateCategoryMetrics = (records: WorkoutRecord[], allAssignments?: ExerciseAssignment[]): CategoryMetrics[] => {
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
      // OPCIÓN 2: Volumen Relativo al Esfuerzo
      // Calcular la distribución de esfuerzo entre categorías
      const totalVolume = record.weight * record.reps * record.sets;
      const effortDistribution = calculateCategoryEffortDistribution(categories);
      const workoutContribution = 1 / categories.length; // Solo dividir workouts, no volumen

      categories.forEach(category => {
        if (!recordsByCategory[category]) {
          recordsByCategory[category] = [];
          workoutsByCategory[category] = 0;
          volumeByCategory[category] = 0;
        }
        recordsByCategory[category].push(record);
        workoutsByCategory[category] += workoutContribution;
        // Asignar volumen basado en el esfuerzo relativo de cada categoría
        volumeByCategory[category] += totalVolume * (effortDistribution[category] || 0);
      });
    }
  });

  // Calcular totalVolume para porcentajes consistentes
  const totalVolume = Object.values(volumeByCategory).reduce((sum, volume) => sum + volume, 0);
  const metrics: CategoryMetrics[] = [];

  // Obtener fecha actual basada en los datos reales
  const currentDate = getCurrentDateFromRecords(records);

  // Calcular métricas para cada categoría
  Object.entries(recordsByCategory).forEach(([category, categoryRecords]) => {
    const workouts = workoutsByCategory[category];
    const categoryVolume = volumeByCategory[category];

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

    const lastWorkout = new Date(Math.max(...dates.map(d => d.getTime())));

    // Usar porcentaje de volumen relativo al esfuerzo
    const percentage = totalVolume > 0 ? (categoryVolume / totalVolume) * 100 : 0;

    // Calcular métricas avanzadas
    const personalRecords = calculatePersonalRecords(categoryRecords);
    const estimatedOneRM = categoryRecords.length > 0 ?
      Math.max(...categoryRecords.map(r => r.weight * (1 + Math.min(r.reps, 20) / 30))) : 0;

    const weightProgression = calculateWeightProgression(categoryRecords, category);
    const volumeProgression = calculateVolumeProgression(categoryRecords, category);
    const intensityScore = calculateIntensityScore(categoryRecords);
    const efficiencyScore = calculateEfficiencyScore(categoryRecords);
    const consistencyScore = calculateConsistencyScore(categoryRecords, avgWorkoutsPerWeek);

    // Usar fecha actual basada en los datos reales en lugar de new Date()
    const daysSinceLastWorkout = Math.floor((currentDate.getTime() - lastWorkout.getTime()) / (1000 * 60 * 60 * 24));

    let trend: 'improving' | 'stable' | 'declining' = 'stable';

    // **CENTRALIZACIÓN**: Usar directamente la lógica de balanceHistory.trend
    // Esto elimina la duplicación y usa el sistema más inteligente
    const balanceHistory = analyzeBalanceHistory(categoryRecords, records, allAssignments);
    trend = balanceHistory.trend; // Usar directamente el resultado del análisis de balance

    const strengthLevel = determineStrengthLevel(estimatedOneRM, category);

    // Pasar todos los records como segundo parámetro para cálculo correcto de fechas
    const volumeDistribution = calculateVolumeDistribution(categoryRecords, records, allAssignments);

    const performanceMetrics = calculateCategoryPerformanceMetrics(categoryRecords);

    // Crear objeto base
    const baseMetrics: Partial<CategoryMetrics> = {
      category,
      workouts: Math.round(workouts * 100) / 100,
      totalVolume: Math.round(categoryVolume),
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
      performanceMetrics,
      recentImprovement
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