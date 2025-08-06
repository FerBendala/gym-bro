import type { CategoryMetrics } from './category-analysis-types';

/**
 * Genera recomendaciones para una categoría
 */
export const generateCategoryRecommendations = (
  category: string,
  metrics: Partial<CategoryMetrics>,
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
export const generateCategoryWarnings = (
  category: string,
  metrics: Partial<CategoryMetrics>,
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
