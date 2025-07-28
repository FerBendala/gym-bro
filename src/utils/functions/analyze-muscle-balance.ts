import { EXERCISE_CATEGORIES, IDEAL_VOLUME_DISTRIBUTION } from '../../constants/exercise.constants';
import type { ExerciseAssignment, WorkoutRecord } from '../../interfaces';
import type { MuscleBalance } from './category-analysis-types';
import {
  analyzeBalanceHistory,
  calculateAntagonistRatio,
  calculateCategoryMetrics,
  calculateStrengthIndex,
  determineDevelopmentStage,
  determinePriorityLevel,
  generateSpecificRecommendations,
  generateWarnings
} from './index';

/**
 * Analiza el balance muscular entre todas las categorías
 */
export const analyzeMuscleBalance = (records: WorkoutRecord[], allAssignments?: ExerciseAssignment[]): MuscleBalance[] => {
  if (records.length === 0) return [];

  const categoryMetrics = calculateCategoryMetrics(records, allAssignments);
  const balance: MuscleBalance[] = [];

  // Calcular total de volumen para porcentajes
  const totalVolume = categoryMetrics.reduce((sum, metric) => sum + metric.totalVolume, 0);

  // Analizar cada categoría
  categoryMetrics.forEach(metric => {
    const category = metric.category;
    const idealPercentage = IDEAL_VOLUME_DISTRIBUTION[category] || 15;
    const actualPercentage = metric.percentage;
    const deviation = actualPercentage - idealPercentage;

    // Determinar si está balanceado (dentro del 5% del ideal)
    const isBalanced = Math.abs(deviation) <= 5;

    // Calcular ratio antagonista
    const antagonistRatio = calculateAntagonistRatio(category, categoryMetrics);

    // Calcular índice de fuerza
    const strengthIndex = calculateStrengthIndex(metric.estimatedOneRM, category);

    // Analizar tendencia de progreso
    const progressTrend = metric.trend;

    // Determinar nivel de prioridad
    const priorityLevel = determinePriorityLevel(deviation, metric.avgWorkoutsPerWeek, progressTrend, isBalanced);

    // Determinar etapa de desarrollo
    const developmentStage = determineDevelopmentStage(strengthIndex, metric.avgWorkoutsPerWeek, metric.totalVolume);

    // Analizar historial de balance
    const categoryRecords = records.filter(r =>
      r.exercise?.categories?.includes(category) ||
      (r.exercise?.categories?.length === 0 && category === 'Sin categoría')
    );
    const balanceHistory = analyzeBalanceHistory(categoryRecords, records, allAssignments);

    // Generar recomendaciones específicas
    const specificRecommendations = generateSpecificRecommendations(category, {
      deviation,
      weeklyFrequency: metric.avgWorkoutsPerWeek,
      progressTrend,
      antagonistRatio,
      intensityScore: metric.intensityScore
    }, { recentImprovement: metric.recentImprovement });

    // Generar advertencias
    const warnings = generateWarnings(category, {
      priorityLevel,
      developmentStage,
      progressTrend,
      antagonistRatio,
      balanceHistory
    }, categoryMetrics);

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
      volume: metric.totalVolume,
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
      weeklyFrequency: metric.avgWorkoutsPerWeek,
      intensityScore: metric.intensityScore,
      balanceHistory,
      specificRecommendations,
      warnings
    });
  });

  // Agregar categorías faltantes con valores por defecto
  EXERCISE_CATEGORIES.forEach(category => {
    const exists = balance.some(b => b.category === category);
    if (!exists) {
      const idealPercentage = IDEAL_VOLUME_DISTRIBUTION[category] || 15;
      balance.push({
        category,
        volume: 0,
        percentage: 0,
        isBalanced: false,
        recommendation: `Añadir entrenamientos de ${category.toLowerCase()}`,
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
        },
        specificRecommendations: [`Incluir ejercicios de ${category.toLowerCase()} en tu rutina`],
        warnings: [`${category} no ha sido entrenado`]
      });
    }
  });

  return balance.sort((a, b) => Math.abs(b.deviation) - Math.abs(a.deviation));
}; 