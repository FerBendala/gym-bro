import { IDEAL_VOLUME_DISTRIBUTION } from '../../constants/exercise.constants';
import { analyzeAntagonistImbalance, getAntagonistGroup } from './antagonist-analysis';
import type { CategoryMetrics, MuscleBalance } from './category-analysis-types';

/**
 * Genera recomendaciones específicas para un grupo muscular
 */
export const generateSpecificRecommendations = (
  category: string,
  balance: Partial<MuscleBalance>,
  context?: { recentImprovement?: boolean }
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

  // Recomendaciones por frecuencia con reconocimiento de mejoras recientes
  if (balance.weeklyFrequency && balance.weeklyFrequency < 2) {
    if (context?.recentImprovement) {
      recommendations.push(`¡Excelente progreso en frecuencia! Mantén esta mejora y busca llegar a 2-3 sesiones semanales consistentes`);
    } else {
      recommendations.push(`Aumentar frecuencia a 2-3 sesiones por semana`);
    }
  } else if (balance.weeklyFrequency && balance.weeklyFrequency >= 2 && balance.weeklyFrequency < 3) {
    if (context?.recentImprovement) {
      recommendations.push(`¡Muy bien! Has mejorado significativamente la frecuencia. Mantén este ritmo de 2+ sesiones semanales`);
    }
  } else if (balance.weeklyFrequency && balance.weeklyFrequency > 4) {
    recommendations.push(`Reducir frecuencia para mejorar recuperación`);
  }

  // Recomendaciones por tendencia
  if (balance.progressTrend === 'declining') {
    recommendations.push(`Revisar técnica y progresión en ${category.toLowerCase()}`);
  } else if (balance.progressTrend === 'stable') {
    recommendations.push(`Variar ejercicios para estimular crecimiento`);
  }

  // Recomendaciones por ratio antagonista - Nueva lógica basada en ratios ideales
  if (balance.antagonistRatio && balance.antagonistRatio > 0) {
    const imbalanceAnalysis = analyzeAntagonistImbalance(category, balance.antagonistRatio);
    const antagonist = getAntagonistGroup(category);

    if (imbalanceAnalysis.hasImbalance && antagonist) {
      if (imbalanceAnalysis.type === 'too_little') {
        recommendations.push(`Aumentar volumen de ${category.toLowerCase()} para equilibrar con ${antagonist.toLowerCase()}`);
      } else if (imbalanceAnalysis.type === 'too_much') {
        recommendations.push(`Reducir volumen de ${category.toLowerCase()} o aumentar ${antagonist.toLowerCase()} para equilibrar`);
      }
    }
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
export const generateWarnings = (
  category: string,
  balance: Partial<MuscleBalance>,
  categoryMetrics: CategoryMetrics[] = []
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

  // Nueva lógica de desequilibrio antagonista basada en ratios ideales
  if (balance.antagonistRatio && balance.antagonistRatio > 0) {
    const imbalanceAnalysis = analyzeAntagonistImbalance(category, balance.antagonistRatio);
    const antagonist = getAntagonistGroup(category);

    if (imbalanceAnalysis.hasImbalance && antagonist) {
      // Solo mostrar advertencia si este grupo debe mostrarla (evitar duplicados)
      if (shouldShowAntagonistWarning(category, antagonist, categoryMetrics)) {
        // Obtener porcentajes reales para contexto
        const categoryData = categoryMetrics.find(m => m.category === category);
        const antagonistData = categoryMetrics.find(m => m.category === antagonist);

        if (categoryData && antagonistData) {
          const categoryPercent = Math.round(categoryData.percentage * 10) / 10;
          const antagonistPercent = Math.round(antagonistData.percentage * 10) / 10;

          if (imbalanceAnalysis.type === 'too_much') {
            warnings.push(`Desequilibrio: ${category.toLowerCase()} ${categoryPercent}% vs ${antagonist.toLowerCase()} ${antagonistPercent}% - considera equilibrar`);
          } else if (imbalanceAnalysis.type === 'too_little') {
            // Determinar si el problema es volumen o frecuencia
            if (balance.weeklyFrequency && balance.weeklyFrequency < 1.5) {
              warnings.push(`${category.toLowerCase()} (${categoryPercent}%) necesita mayor frecuencia semanal vs ${antagonist.toLowerCase()} (${antagonistPercent}%)`);
            } else {
              warnings.push(`${category.toLowerCase()} (${categoryPercent}%) necesita más volumen vs ${antagonist.toLowerCase()} (${antagonistPercent}%)`);
            }
          }
        }
      }
    }
  }

  if (balance.balanceHistory?.volatility && balance.balanceHistory.volatility > 70) {
    const volatilityPercent = Math.round(balance.balanceHistory.volatility);
    if (volatilityPercent > 85) {
      warnings.push(`Entrenamiento muy irregular en ${category.toLowerCase()} (${volatilityPercent}% variación) - establece rutina más consistente`);
    } else {
      warnings.push(`Entrenamiento irregular en ${category.toLowerCase()} (${volatilityPercent}% variación) - intenta ser más constante`);
    }
  }

  return warnings;
};

/**
 * Determina si debe mostrar advertencia antagonista para evitar duplicados
 * Solo muestra la advertencia desde el grupo con mayor desviación
 */
export const shouldShowAntagonistWarning = (
  category: string,
  antagonist: string,
  categoryMetrics: CategoryMetrics[]
): boolean => {
  // Obtener métricas de ambos grupos
  const categoryData = categoryMetrics.find(m => m.category === category);
  const antagonistData = categoryMetrics.find(m => m.category === antagonist);

  if (!categoryData || !antagonistData) return false;

  // Calcular desviaciones absolutas respecto a sus ideales individuales
  const categoryIdeal = IDEAL_VOLUME_DISTRIBUTION[category] || 15;
  const antagonistIdeal = IDEAL_VOLUME_DISTRIBUTION[antagonist] || 15;

  const categoryDeviation = Math.abs(categoryData.percentage - categoryIdeal);
  const antagonistDeviation = Math.abs(antagonistData.percentage - antagonistIdeal);

  // Solo mostrar desde el grupo con mayor desviación individual
  // En caso de empate, usar orden alfabético para consistencia
  if (categoryDeviation === antagonistDeviation) {
    return category < antagonist;
  }

  return categoryDeviation > antagonistDeviation;
}; 