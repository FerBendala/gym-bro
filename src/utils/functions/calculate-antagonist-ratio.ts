import { IDEAL_VOLUME_DISTRIBUTION } from '@/constants';
import { ANTAGONIST_PAIRS } from './category-analysis-types';

/**
 * Obtiene el grupo muscular antagonista para una categoría dada
 */
export const getAntagonistGroup = (category: string): string | null => {
  return ANTAGONIST_PAIRS[category] || null;
};

/**
 * Calcula el ratio ideal entre un grupo muscular y su antagonista
 */
const calculateIdealAntagonistRatio = (category: string): number => {
  const antagonist = ANTAGONIST_PAIRS[category];
  if (!antagonist) return 1;

  const categoryIdeal = IDEAL_VOLUME_DISTRIBUTION[category] || 15;
  const antagonistIdeal = IDEAL_VOLUME_DISTRIBUTION[antagonist] || 15;

  return categoryIdeal / antagonistIdeal;
};

/**
 * Analiza el desequilibrio antagonista comparando con el ratio ideal
 */
export const analyzeAntagonistImbalance = (category: string, actualRatio: number): {
  hasImbalance: boolean;
  type: 'too_much' | 'too_little' | 'balanced';
  severity: 'mild' | 'moderate' | 'severe';
  deviation: number;
} => {
  const idealRatio = calculateIdealAntagonistRatio(category);
  const deviation = ((actualRatio - idealRatio) / idealRatio) * 100;

  // Umbrales basados en porcentaje de desviación del ratio ideal
  const mildThreshold = 20; // ±20%
  const moderateThreshold = 40; // ±40%

  if (Math.abs(deviation) <= mildThreshold) {
    return { hasImbalance: false, type: 'balanced', severity: 'mild', deviation };
  }

  const type = deviation > 0 ? 'too_much' : 'too_little';
  const severity = Math.abs(deviation) > moderateThreshold ? 'severe' : 'moderate';

  return { hasImbalance: true, type, severity, deviation };
}; 