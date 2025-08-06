import { Activity, Dumbbell, Footprints } from 'lucide-react';

import { calculateIdealPercentages, TREND_THRESHOLDS, validatePercentage, validateVolume } from '../constants';
import type { CategoryAnalysis, MetaCategoryData, MuscleBalanceItem, TrendType, UpperLowerBalanceData } from '../types';

// Función centralizada para calcular tendencia
export const calculateTrendFromMuscleBalance = (muscleBalanceData: MuscleBalanceItem[]): TrendType => {
  if (!muscleBalanceData || muscleBalanceData.length === 0) {
    return 'stable';
  }

  const improvingCount = muscleBalanceData.filter((b) => b.balanceHistory?.trend === 'improving').length;
  const stableCount = muscleBalanceData.filter((b) => b.balanceHistory?.trend === 'stable').length;
  const decliningCount = muscleBalanceData.filter((b) => b.balanceHistory?.trend === 'declining').length;

  // Lógica mejorada: si la mayoría está mejorando, es improving
  if (improvingCount > decliningCount && improvingCount > stableCount) {
    return 'improving';
  } else if (decliningCount > improvingCount && decliningCount > stableCount) {
    return 'declining';
  } else if (stableCount > improvingCount && stableCount > decliningCount) {
    return 'stable';
  } else if (improvingCount === decliningCount && improvingCount > 0) {
    return 'stable'; // Empate entre improving y declining
  } else if (improvingCount > 0) {
    return 'improving'; // Si hay al menos uno mejorando y no hay declining mayoritario
  }

  return 'stable';
};

// Función para validar datos de balance
const validateBalanceData = (upperLowerBalance: UpperLowerBalanceData): boolean => {
  if (!upperLowerBalance) return false;

  const { upperBody, lowerBody, core } = upperLowerBalance;

  return !!(upperBody && lowerBody && core &&
    typeof upperBody.percentage === 'number' &&
    typeof upperBody.volume === 'number' &&
    typeof lowerBody.percentage === 'number' &&
    typeof lowerBody.volume === 'number' &&
    typeof core.percentage === 'number' &&
    typeof core.volume === 'number');
};

export const createMetaCategoryData = (
  upperLowerBalance: UpperLowerBalanceData,
  userVolumeDistribution: Record<string, number>,
): MetaCategoryData[] => {
  // Validar datos de entrada
  if (!validateBalanceData(upperLowerBalance)) {
    return [];
  }

  // Calcular porcentajes ideales dinámicamente
  const idealPercentages = calculateIdealPercentages(userVolumeDistribution);

  const metaCategoryData: MetaCategoryData[] = [
    {
      category: 'Tren Superior',
      icon: Dumbbell,
      color: '#3B82F6',
      gradient: 'from-blue-500 to-blue-700',
      percentage: validatePercentage(upperLowerBalance.upperBody.percentage),
      volume: validateVolume(upperLowerBalance.upperBody.volume),
      idealPercentage: idealPercentages.UPPER_BODY,
      categories: upperLowerBalance.upperBody.categories || [],
      isBalanced: Math.abs(upperLowerBalance.upperBody.percentage - idealPercentages.UPPER_BODY) <= TREND_THRESHOLDS.BALANCE_TOLERANCE,
    },
    {
      category: 'Tren Inferior',
      icon: Footprints,
      color: '#10B981',
      gradient: 'from-green-500 to-green-700',
      percentage: validatePercentage(upperLowerBalance.lowerBody.percentage),
      volume: validateVolume(upperLowerBalance.lowerBody.volume),
      idealPercentage: idealPercentages.LOWER_BODY,
      categories: upperLowerBalance.lowerBody.categories || [],
      isBalanced: Math.abs(upperLowerBalance.lowerBody.percentage - idealPercentages.LOWER_BODY) <= TREND_THRESHOLDS.BALANCE_TOLERANCE,
    },
  ];

  // Agregar Core si tiene volumen
  if (upperLowerBalance.core.volume > 0) {
    metaCategoryData.push({
      category: 'Core',
      icon: Activity,
      color: '#6366F1',
      gradient: 'from-indigo-500 to-indigo-700',
      percentage: validatePercentage(upperLowerBalance.core.percentage),
      volume: validateVolume(upperLowerBalance.core.volume),
      idealPercentage: idealPercentages.CORE,
      categories: upperLowerBalance.core.categories || [],
      isBalanced: Math.abs(upperLowerBalance.core.percentage - idealPercentages.CORE) <= TREND_THRESHOLDS.BALANCE_TOLERANCE,
    });
  }

  return metaCategoryData;
};

export const calculateAggregatedMetrics = (meta: MetaCategoryData, categoryAnalysis: CategoryAnalysis) => {
  if (!categoryAnalysis?.categoryMetrics) {
    return {
      totalFrequency: 0,
      avgIntensity: 0,
      totalRecords: 0,
      avgStrength: 0,
    };
  }

  const categoryMetrics = meta.categories
    .map((cat: string) => categoryAnalysis.categoryMetrics.find((m) => m.category === cat))
    .filter((m): m is NonNullable<typeof m> => m !== undefined);

  if (categoryMetrics.length === 0) {
    return {
      totalFrequency: 0,
      avgIntensity: 0,
      totalRecords: 0,
      avgStrength: 0,
    };
  }

  const totalFrequency = categoryMetrics.reduce((sum: number, m) => sum + (m.avgWorkoutsPerWeek || 0), 0) / categoryMetrics.length;
  const avgIntensity = categoryMetrics.reduce((sum: number, m) => sum + (m.intensityScore || 0), 0) / categoryMetrics.length;
  const totalRecords = categoryMetrics.reduce((sum: number, m) => sum + (m.personalRecords || 0), 0);
  const avgStrength = categoryMetrics.reduce((sum: number, m) => sum + (m.progressTrend?.strength || 0), 0) / categoryMetrics.length;

  return {
    totalFrequency: Math.max(0, totalFrequency),
    avgIntensity: validatePercentage(avgIntensity),
    totalRecords: Math.max(0, totalRecords),
    avgStrength: Math.max(-100, Math.min(100, avgStrength)),
  };
};

export const determineTrend = (muscleBalanceData: MuscleBalanceItem[]): TrendType => {
  return calculateTrendFromMuscleBalance(muscleBalanceData);
};

export const calculateChartData = (
  meta: MetaCategoryData,
  categoryAnalysis: CategoryAnalysis,
  muscleBalance: MuscleBalanceItem[],
) => {
  const { totalFrequency, avgIntensity, totalRecords, avgStrength } = calculateAggregatedMetrics(meta, categoryAnalysis);

  const muscleBalanceData = meta.categories
    .map((cat: string) => muscleBalance.find((b) => b.category === cat))
    .filter((b): b is NonNullable<typeof b> => b !== undefined);

  const trend = determineTrend(muscleBalanceData);

  return {
    volume: validatePercentage(meta.percentage),
    idealVolume: validatePercentage(meta.idealPercentage),
    intensity: validatePercentage(avgIntensity),
    frequency: Math.max(0, totalFrequency),
    strength: Math.max(-100, Math.min(100, avgStrength)),
    records: Math.max(0, totalRecords),
    trend: trend === 'improving' ? '+' : trend === 'declining' ? '-' : '=',
  };
};
