import { roundToDecimals } from '@/utils/functions/math-utils';
import { META_CATEGORIES } from './balance-types';

/**
 * Calcula balance tren superior vs inferior
 * @param categoryMetrics - Métricas por categoría
 * @param userVolumeDistribution - Configuración de volumen del usuario
 * @returns Balance superior/inferior
 */
export const calculateUpperLowerBalance = (
  categoryMetrics: { category: string; percentage: number; totalVolume: number }[],
  userVolumeDistribution: Record<string, number>,
) => {
  const upperBodyCategories = META_CATEGORIES.UPPER_BODY.categories;
  const lowerBodyCategories = META_CATEGORIES.LOWER_BODY.categories;
  const coreCategories = META_CATEGORIES.CORE.categories;

  // Calcular porcentajes ideales dinámicamente basados en la configuración del usuario
  const upperBodyIdeal = upperBodyCategories.reduce((sum, category) => {
    return sum + (userVolumeDistribution[category] || 0);
  }, 0);

  const lowerBodyIdeal = lowerBodyCategories.reduce((sum, category) => {
    return sum + (userVolumeDistribution[category] || 0);
  }, 0);

  const coreIdeal = coreCategories.reduce((sum, category) => {
    return sum + (userVolumeDistribution[category] || 0);
  }, 0);

  // Filtrar métricas por categoría
  const upperBodyMetrics = categoryMetrics.filter(m => upperBodyCategories.includes(m.category));
  const lowerBodyMetrics = categoryMetrics.filter(m => lowerBodyCategories.includes(m.category));
  const coreMetrics = categoryMetrics.filter(m => coreCategories.includes(m.category));

  // Calcular volúmenes reales de cada meta-categoría
  const upperBodyVolume = upperBodyMetrics.reduce((sum, m) => sum + m.totalVolume, 0);
  const lowerBodyVolume = lowerBodyMetrics.reduce((sum, m) => sum + m.totalVolume, 0);
  const coreVolume = coreMetrics.reduce((sum, m) => sum + m.totalVolume, 0);

  // Calcular volumen total real para normalización
  const totalVolume = upperBodyVolume + lowerBodyVolume + coreVolume;

  // Calcular porcentajes basados en volúmenes reales
  const upperBodyPercentage = totalVolume > 0 ? (upperBodyVolume / totalVolume) * 100 : 0;
  const lowerBodyPercentage = totalVolume > 0 ? (lowerBodyVolume / totalVolume) * 100 : 0;
  const corePercentage = totalVolume > 0 ? (coreVolume / totalVolume) * 100 : 0;

  const upperBody = {
    percentage: roundToDecimals(upperBodyPercentage, 1),
    volume: Math.round(upperBodyVolume),
    categories: upperBodyCategories,
  };

  const lowerBody = {
    percentage: roundToDecimals(lowerBodyPercentage, 1),
    volume: Math.round(lowerBodyVolume),
    categories: lowerBodyCategories,
  };

  const core = {
    percentage: roundToDecimals(corePercentage, 1),
    volume: Math.round(coreVolume),
    categories: coreCategories,
  };

  // Calcular balance basado en desviación de porcentajes individuales vs ideales dinámicos
  const upperBodyDeviation = Math.abs(upperBody.percentage - upperBodyIdeal);
  const lowerBodyDeviation = Math.abs(lowerBody.percentage - lowerBodyIdeal);
  const coreDeviation = Math.abs(core.percentage - coreIdeal);

  // Considerar balanceado si ninguna categoría se desvía más de 5% del ideal
  const maxAcceptableDeviation = 5;
  const isBalanced = upperBodyDeviation <= maxAcceptableDeviation &&
    lowerBodyDeviation <= maxAcceptableDeviation &&
    coreDeviation <= maxAcceptableDeviation;

  // Generar recomendación basada en las mayores desviaciones
  let recommendation = 'El balance entre tren superior e inferior es adecuado';

  if (!isBalanced) {
    const deviations = [
      { category: 'Tren Superior', deviation: upperBodyDeviation, current: upperBody.percentage, ideal: upperBodyIdeal },
      { category: 'Tren Inferior', deviation: lowerBodyDeviation, current: lowerBody.percentage, ideal: lowerBodyIdeal },
      { category: 'Core', deviation: coreDeviation, current: core.percentage, ideal: coreIdeal },
    ];

    // Ordenar por desviación descendente
    deviations.sort((a, b) => b.deviation - a.deviation);

    const worstDeviation = deviations[0];
    if (worstDeviation.current > worstDeviation.ideal) {
      recommendation = `Considera reducir el entrenamiento de ${worstDeviation.category} (${roundToDecimals(worstDeviation.current, 1)}% vs ${roundToDecimals(worstDeviation.ideal, 1)}% ideal)`;
    } else {
      recommendation = `Considera aumentar el entrenamiento de ${worstDeviation.category} (${roundToDecimals(worstDeviation.current, 1)}% vs ${roundToDecimals(worstDeviation.ideal, 1)}% ideal)`;
    }
  }

  return {
    upperBody: {
      percentage: upperBody.percentage,
      volume: upperBody.volume,
      categories: upperBody.categories,
    },
    lowerBody: {
      percentage: lowerBody.percentage,
      volume: lowerBody.volume,
      categories: lowerBody.categories,
    },
    core: {
      percentage: core.percentage,
      volume: core.volume,
      categories: core.categories,
    },
    isBalanced,
    recommendation,
  };
};
