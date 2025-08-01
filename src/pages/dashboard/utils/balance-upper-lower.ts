import { roundToDecimals } from '@/utils/functions/math-utils';
import { META_CATEGORIES } from './balance-types';

/**
 * Calcula balance tren superior vs inferior
 * @param categoryMetrics - Métricas por categoría
 * @returns Balance superior/inferior
 */
export const calculateUpperLowerBalance = (categoryMetrics: { category: string; percentage: number; totalVolume: number }[]) => {
  const upperBodyCategories = ['Pecho', 'Espalda', 'Hombros', 'Brazos'];
  const lowerBodyCategories = ['Piernas'];
  const coreCategories = ['Core'];

  const upperBody = {
    percentage: categoryMetrics
      .filter(m => upperBodyCategories.includes(m.category))
      .reduce((sum, m) => sum + m.percentage, 0),
    volume: categoryMetrics
      .filter(m => upperBodyCategories.includes(m.category))
      .reduce((sum, m) => sum + m.totalVolume, 0),
    categories: upperBodyCategories,
  };

  const lowerBody = {
    percentage: categoryMetrics
      .filter(m => lowerBodyCategories.includes(m.category))
      .reduce((sum, m) => sum + m.percentage, 0),
    volume: categoryMetrics
      .filter(m => lowerBodyCategories.includes(m.category))
      .reduce((sum, m) => sum + m.totalVolume, 0),
    categories: lowerBodyCategories,
  };

  const core = {
    percentage: categoryMetrics
      .filter(m => coreCategories.includes(m.category))
      .reduce((sum, m) => sum + m.percentage, 0),
    volume: categoryMetrics
      .filter(m => coreCategories.includes(m.category))
      .reduce((sum, m) => sum + m.totalVolume, 0),
    categories: coreCategories,
  };

  // Calcular balance basado en desviación de porcentajes individuales vs ideales
  const upperBodyDeviation = Math.abs(upperBody.percentage - META_CATEGORIES.UPPER_BODY.idealPercentage);
  const lowerBodyDeviation = Math.abs(lowerBody.percentage - META_CATEGORIES.LOWER_BODY.idealPercentage);
  const coreDeviation = Math.abs(core.percentage - META_CATEGORIES.CORE.idealPercentage);

  // Considerar balanceado si ninguna categoría se desvía más de 5% del ideal
  const maxAcceptableDeviation = 5;
  const isBalanced = upperBodyDeviation <= maxAcceptableDeviation &&
    lowerBodyDeviation <= maxAcceptableDeviation &&
    coreDeviation <= maxAcceptableDeviation;

  // Generar recomendación basada en las mayores desviaciones
  let recommendation = 'El balance entre tren superior e inferior es adecuado';

  if (!isBalanced) {
    const deviations = [
      { category: 'Tren Superior', deviation: upperBodyDeviation, current: upperBody.percentage, ideal: META_CATEGORIES.UPPER_BODY.idealPercentage },
      { category: 'Tren Inferior', deviation: lowerBodyDeviation, current: lowerBody.percentage, ideal: META_CATEGORIES.LOWER_BODY.idealPercentage },
      { category: 'Core', deviation: coreDeviation, current: core.percentage, ideal: META_CATEGORIES.CORE.idealPercentage },
    ];

    // Ordenar por desviación descendente
    deviations.sort((a, b) => b.deviation - a.deviation);

    const worstDeviation = deviations[0];
    if (worstDeviation.current > worstDeviation.ideal) {
      recommendation = `Considera reducir el entrenamiento de ${worstDeviation.category} (${roundToDecimals(worstDeviation.current, 1)}% vs ${worstDeviation.ideal}% ideal)`;
    } else {
      recommendation = `Considera aumentar el entrenamiento de ${worstDeviation.category} (${roundToDecimals(worstDeviation.current, 1)}% vs ${worstDeviation.ideal}% ideal)`;
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
