import type { MuscleBalance } from './category-analysis-types';

import {
  calculateCategoryMetrics,
} from './index';

import { EXERCISE_CATEGORIES, IDEAL_VOLUME_DISTRIBUTION } from '@/constants';
import type { WorkoutRecord } from '@/interfaces';

/**
 * Analiza el balance muscular entre todas las categorías
 */
export const analyzeMuscleBalance = (records: WorkoutRecord[]): MuscleBalance[] => {
  if (records.length === 0) return [];

  const balance: MuscleBalance[] = [];

  // Analizar cada categoría
  EXERCISE_CATEGORIES.forEach(category => {
    const categoryMetrics = calculateCategoryMetrics(records, category);

    const idealPercentage = IDEAL_VOLUME_DISTRIBUTION[category] || 15;
    const actualPercentage = categoryMetrics.percentage;
    const deviation = actualPercentage - idealPercentage;

    // Determinar si está balanceado (dentro del 5% del ideal)
    const isBalanced = Math.abs(deviation) <= 5;

    // Calcular ratio antagonista (simplificado)
    const antagonistRatio = 1.0; // TODO: Implementar cálculo real

    // Calcular índice de fuerza (simplificado)
    const strengthIndex = categoryMetrics.estimatedOneRM / 100; // Normalizado

    // Analizar tendencia de progreso (simplificado)
    const progressTrend = categoryMetrics.weightProgression > 0 ? 'improving' : 'stable';

    // Determinar nivel de prioridad (simplificado)
    const priorityLevel = deviation < -10 ? 'critical' : deviation < -5 ? 'high' : 'normal';

    // Determinar etapa de desarrollo (simplificado)
    const developmentStage = categoryMetrics.workoutCount === 0 ? 'neglected' :
      categoryMetrics.avgWorkoutsPerWeek < 1 ? 'beginner' : 'intermediate';

    // Analizar historial de balance (simplificado)
    const balanceHistory = {
      trend: 'stable',
      consistency: categoryMetrics.consistencyScore,
      volatility: 0,
    };

    // Generar recomendaciones específicas (simplificado)
    const specificRecommendations = [];
    if (deviation < -10) {
      specificRecommendations.push(`Aumentar volumen de ${category.toLowerCase()}`);
    } else if (deviation > 10) {
      specificRecommendations.push(`Reducir volumen de ${category.toLowerCase()}`);
    }

    // Generar advertencias (simplificado)
    const warnings = [];
    if (categoryMetrics.workoutCount === 0) {
      warnings.push(`${category} no ha sido entrenado`);
    }

    // Crear recomendación general
    let recommendation = '';
    if (isBalanced) {
      recommendation = `${category} está bien balanceado`;
    } else if (deviation > 0) {
      recommendation = `Reducir volumen de ${category.toLowerCase()}`;
    } else {
      recommendation = `Aumentar volumen de ${category.toLowerCase()}`;
    }

    balance.push({
      category,
      volume: categoryMetrics.totalVolume,
      percentage: actualPercentage,
      isBalanced,
      recommendation,
      idealPercentage,
      deviation,
      symmetryScore: 0, // TODO: Implementar cálculo de simetría
      antagonistRatio,
      strengthIndex,
      progressTrend,
      lastImprovement: null, // TODO: Implementar detección de última mejora
      priorityLevel,
      developmentStage,
      weeklyFrequency: categoryMetrics.avgWorkoutsPerWeek,
      intensityScore: categoryMetrics.intensityScore,
      balanceHistory,
      specificRecommendations,
      warnings,
    });
  });

  return balance.sort((a, b) => Math.abs(b.deviation) - Math.abs(a.deviation));
};
