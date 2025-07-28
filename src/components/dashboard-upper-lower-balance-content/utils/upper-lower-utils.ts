import { Activity, Dumbbell, Footprints } from 'lucide-react';
import { META_CATEGORIES, TREND_THRESHOLDS } from '../constants';
import type { CategoryAnalysis, MetaCategoryData, MuscleBalanceItem, TrendType, UpperLowerBalanceData } from '../types';

export const createMetaCategoryData = (upperLowerBalance: UpperLowerBalanceData): MetaCategoryData[] => {
  const metaCategoryData: MetaCategoryData[] = [
    {
      category: 'Tren Superior',
      icon: Dumbbell,
      color: '#3B82F6',
      gradient: 'from-blue-500 to-blue-700',
      percentage: upperLowerBalance.upperBody.percentage,
      volume: upperLowerBalance.upperBody.volume,
      idealPercentage: META_CATEGORIES.UPPER_BODY.idealPercentage,
      categories: upperLowerBalance.upperBody.categories,
      isBalanced: Math.abs(upperLowerBalance.upperBody.percentage - META_CATEGORIES.UPPER_BODY.idealPercentage) <= TREND_THRESHOLDS.BALANCE_TOLERANCE
    },
    {
      category: 'Tren Inferior',
      icon: Footprints,
      color: '#10B981',
      gradient: 'from-green-500 to-green-700',
      percentage: upperLowerBalance.lowerBody.percentage,
      volume: upperLowerBalance.lowerBody.volume,
      idealPercentage: META_CATEGORIES.LOWER_BODY.idealPercentage,
      categories: upperLowerBalance.lowerBody.categories,
      isBalanced: Math.abs(upperLowerBalance.lowerBody.percentage - META_CATEGORIES.LOWER_BODY.idealPercentage) <= TREND_THRESHOLDS.BALANCE_TOLERANCE
    }
  ];

  // Agregar Core si tiene volumen
  if (upperLowerBalance.core.volume > 0) {
    metaCategoryData.push({
      category: 'Core',
      icon: Activity,
      color: '#6366F1',
      gradient: 'from-indigo-500 to-indigo-700',
      percentage: upperLowerBalance.core.percentage,
      volume: upperLowerBalance.core.volume,
      idealPercentage: META_CATEGORIES.CORE.idealPercentage,
      categories: upperLowerBalance.core.categories,
      isBalanced: Math.abs(upperLowerBalance.core.percentage - META_CATEGORIES.CORE.idealPercentage) <= TREND_THRESHOLDS.BALANCE_TOLERANCE
    });
  }

  return metaCategoryData;
};

export const calculateAggregatedMetrics = (meta: MetaCategoryData, categoryAnalysis: CategoryAnalysis) => {
  const categoryMetrics = meta.categories
    .map((cat: string) => categoryAnalysis.categoryMetrics.find((m) => m.category === cat))
    .filter((m): m is NonNullable<typeof m> => m !== undefined);

  const totalFrequency = categoryMetrics.reduce((sum: number, m) => sum + (m.avgWorkoutsPerWeek || 0), 0) / Math.max(1, categoryMetrics.length);
  const avgIntensity = categoryMetrics.reduce((sum: number, m) => sum + (m.intensityScore || 0), 0) / Math.max(1, categoryMetrics.length);
  const totalRecords = categoryMetrics.reduce((sum: number, m) => sum + (m.personalRecords || 0), 0);
  const avgStrength = categoryMetrics.reduce((sum: number, m) => sum + (m.progressTrend?.strength || 0), 0) / Math.max(1, categoryMetrics.length);

  return {
    totalFrequency,
    avgIntensity,
    totalRecords,
    avgStrength
  };
};

export const determineTrend = (muscleBalanceData: MuscleBalanceItem[]): TrendType => {
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

export const calculateChartData = (
  meta: MetaCategoryData,
  categoryAnalysis: CategoryAnalysis,
  muscleBalance: MuscleBalanceItem[]
) => {
  const { totalFrequency, avgIntensity, totalRecords, avgStrength } = calculateAggregatedMetrics(meta, categoryAnalysis);

  const muscleBalanceData = meta.categories
    .map((cat: string) => muscleBalance.find((b) => b.category === cat))
    .filter((b): b is NonNullable<typeof b> => b !== undefined);

  const trend = determineTrend(muscleBalanceData);

  return {
    volume: meta.percentage,
    idealVolume: meta.idealPercentage,
    intensity: avgIntensity,
    frequency: totalFrequency,
    strength: avgStrength,
    records: totalRecords,
    trend: trend === 'improving' ? '+' : trend === 'declining' ? '-' : '='
  };
}; 