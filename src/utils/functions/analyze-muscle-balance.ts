import type { MuscleBalance } from './category-analysis-types';

import {
  calculateCategoryMetrics,
} from './index';

import { EXERCISE_CATEGORIES, IDEAL_VOLUME_DISTRIBUTION } from '@/constants';
import type { WorkoutRecord } from '@/interfaces';

/**
 * Analiza el balance muscular entre todas las categorías
 */
export const analyzeMuscleBalance = (
  records: WorkoutRecord[],
  customVolumeDistribution?: Record<string, number>,
): MuscleBalance[] => {
  if (records.length === 0) return [];

  const balance: MuscleBalance[] = [];

  // Primero calcular todos los porcentajes para normalizar
  const categoryPercentages: Record<string, number> = {};
  let totalPercentage = 0;

  // Calcular porcentajes brutos
  EXERCISE_CATEGORIES.forEach(category => {
    const categoryMetrics = calculateCategoryMetrics(records, category);
    categoryPercentages[category] = categoryMetrics.percentage;
    totalPercentage += categoryMetrics.percentage;
  });

  // Normalizar porcentajes para que sumen 100%
  const normalizedPercentages: Record<string, number> = {};
  if (totalPercentage > 0) {
    EXERCISE_CATEGORIES.forEach(category => {
      normalizedPercentages[category] = (categoryPercentages[category] / totalPercentage) * 100;
    });
  }

  // Analizar cada categoría con porcentajes normalizados
  EXERCISE_CATEGORIES.forEach(category => {
    const categoryMetrics = calculateCategoryMetrics(records, category);

    const idealPercentage = customVolumeDistribution?.[category] || IDEAL_VOLUME_DISTRIBUTION[category] || 15;
    const actualPercentage = normalizedPercentages[category] || 0;
    const deviation = actualPercentage - idealPercentage;

    // Determinar si está balanceado (dentro del 10% del ideal para ser más realista)
    const isBalanced = Math.abs(deviation) <= 10;

    // Calcular ratio antagonista (simplificado)
    const antagonistRatio = 1.0; // TODO: Implementar cálculo real

    // Calcular índice de fuerza (simplificado)
    const strengthIndex = categoryMetrics.estimatedOneRM / 100; // Normalizado

    // Analizar tendencia de progreso (simplificado)
    const progressTrend = categoryMetrics.weightProgression > 0 ? 'improving' : 'stable';

    // Determinar nivel de prioridad basado en desviación y rendimiento
    let priorityLevel: 'low' | 'medium' | 'high' | 'critical';

    if (deviation < -15) {
      priorityLevel = 'critical';
    } else if (deviation < -5) {
      priorityLevel = 'high';
    } else if (deviation > 15) {
      priorityLevel = 'high'; // También alta prioridad si está muy sobre-entrenado
    } else if (Math.abs(deviation) <= 3) {
      priorityLevel = 'low';
    } else {
      priorityLevel = 'medium';
    }

    // Determinar etapa de desarrollo (simplificado)
    const developmentStage = categoryMetrics.workoutCount === 0 ? 'neglected' :
      categoryMetrics.avgWorkoutsPerWeek < 1 ? 'beginner' : 'intermediate';

    // Analizar historial de balance basado en progresión real
    const trend = categoryMetrics.weightProgression > 5 ? 'improving' :
      categoryMetrics.weightProgression < -5 ? 'declining' : 'stable';
    const balanceHistory = {
      trend,
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

  // Mantener el orden original de las categorías en lugar de ordenar por desviación
  return balance;
};
