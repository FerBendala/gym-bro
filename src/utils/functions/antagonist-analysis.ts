import { IDEAL_VOLUME_DISTRIBUTION } from '../../constants/exercise.constants';
import type { WorkoutRecord } from '../../interfaces';
import type { CategoryMetrics } from './category-analysis-types';
import { ANTAGONIST_PAIRS } from './category-analysis-types';
import { STRENGTH_STANDARDS } from './strength-standards';

/**
 * Calcula el score de simetría para una categoría
 */
export const calculateSymmetryScore = (_: string, categoryRecords: WorkoutRecord[]): number => {
  if (categoryRecords.length === 0) return 0;

  // Análisis de simetría basado en variabilidad de pesos y repeticiones
  const weights = categoryRecords.map(r => r.weight);
  const reps = categoryRecords.map(r => r.reps);

  // Coeficiente de variación para pesos
  const weightMean = weights.reduce((sum, w) => sum + w, 0) / weights.length;
  const weightVariance = weights.reduce((sum, w) => sum + Math.pow(w - weightMean, 2), 0) / weights.length;
  const weightCV = weightVariance > 0 ? Math.sqrt(weightVariance) / weightMean : 0;

  // Coeficiente de variación para repeticiones
  const repMean = reps.reduce((sum, r) => sum + r, 0) / reps.length;
  const repVariance = reps.reduce((sum, r) => sum + Math.pow(r - repMean, 2), 0) / reps.length;
  const repCV = repVariance > 0 ? Math.sqrt(repVariance) / repMean : 0;

  // Score de simetría: menor variabilidad = mejor simetría
  const symmetryScore = Math.max(0, 100 - ((weightCV + repCV) * 50));
  return Math.round(symmetryScore);
};

/**
 * Calcula el ratio antagonista para un grupo muscular
 */
export const calculateAntagonistRatio = (category: string, categoryMetrics: CategoryMetrics[]): number => {
  const antagonist = ANTAGONIST_PAIRS[category];
  if (!antagonist) return 1; // No hay antagonista directo

  const currentMetric = categoryMetrics.find(m => m.category === category);
  const antagonistMetric = categoryMetrics.find(m => m.category === antagonist);

  if (!currentMetric || !antagonistMetric || antagonistMetric.totalVolume === 0) {
    return 0;
  }

  return Math.round((currentMetric.totalVolume / antagonistMetric.totalVolume) * 100) / 100;
};

/**
 * Obtiene el grupo muscular antagonista para una categoría dada
 */
export const getAntagonistGroup = (category: string): string | null => {
  return ANTAGONIST_PAIRS[category] || null;
};

/**
 * Calcula el ratio ideal entre un grupo muscular y su antagonista
 */
export const calculateIdealAntagonistRatio = (category: string): number => {
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

/**
 * Calcula el índice de fuerza para un grupo muscular usando estándares específicos
 * Opción mejorada que considera las diferencias naturales entre categorías musculares
 */
export const calculateStrengthIndex = (categoryRecordsOrOneRM: WorkoutRecord[] | number, category?: string): number => {
  let avgOneRM: number;
  let targetCategory: string | undefined;

  if (Array.isArray(categoryRecordsOrOneRM)) {
    // Formato antiguo: array de WorkoutRecord[]
    const categoryRecords = categoryRecordsOrOneRM;
    if (categoryRecords.length === 0) return 0;

    // Calcular 1RM estimado promedio
    const estimatedOneRMs = categoryRecords.map(record => {
      return record.weight * (1 + Math.min(record.reps, 20) / 30);
    });

    avgOneRM = estimatedOneRMs.reduce((sum, orm) => sum + orm, 0) / estimatedOneRMs.length;

    // Obtener la categoría del primer record (asumiendo que todos son de la misma categoría)
    targetCategory = categoryRecords[0]?.exercise?.categories?.[0];
  } else {
    // Formato nuevo: número (1RM estimado) + categoría
    avgOneRM = categoryRecordsOrOneRM;
    targetCategory = category;
  }

  if (!targetCategory || !STRENGTH_STANDARDS[targetCategory]) {
    // Fallback para categorías sin estándares definidos
    return Math.min(100, Math.round((avgOneRM / 50) * 100));
  }

  const standards = STRENGTH_STANDARDS[targetCategory];

  // Calcular índice basado en los estándares específicos de la categoría
  if (avgOneRM >= standards.elite) {
    // Elite: 90-100 puntos
    const eliteProgress = Math.min(1, (avgOneRM - standards.elite) / (standards.elite * 0.3));
    return Math.round(90 + (eliteProgress * 10));
  } else if (avgOneRM >= standards.advanced) {
    // Avanzado: 70-89 puntos
    const advancedProgress = (avgOneRM - standards.advanced) / (standards.elite - standards.advanced);
    return Math.round(70 + (advancedProgress * 19));
  } else if (avgOneRM >= standards.intermediate) {
    // Intermedio: 50-69 puntos
    const intermediateProgress = (avgOneRM - standards.intermediate) / (standards.advanced - standards.intermediate);
    return Math.round(50 + (intermediateProgress * 19));
  } else if (avgOneRM >= standards.beginner) {
    // Principiante: 25-49 puntos
    const beginnerProgress = (avgOneRM - standards.beginner) / (standards.intermediate - standards.beginner);
    return Math.round(25 + (beginnerProgress * 24));
  } else {
    // Por debajo de principiante: 0-24 puntos
    const preBeginnerProgress = Math.min(1, avgOneRM / standards.beginner);
    return Math.round(preBeginnerProgress * 24);
  }
};

/**
 * Obtiene la etiqueta descriptiva del nivel de fuerza
 */
export const getStrengthLevelLabel = (strengthIndex: number): 'principiante' | 'intermedio' | 'avanzado' | 'elite' => {
  if (strengthIndex >= 90) return 'elite';
  if (strengthIndex >= 70) return 'avanzado';
  if (strengthIndex >= 50) return 'intermedio';
  return 'principiante';
}; 