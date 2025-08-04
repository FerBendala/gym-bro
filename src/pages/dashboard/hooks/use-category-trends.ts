import { useMemo } from 'react';

import type { WorkoutRecord } from '@/interfaces';
import type { DayMetrics } from '@/utils/functions/trends-interfaces';
import { analyzeMaxWeightByCategory } from '@/utils/functions/category-trends';

interface UseCategoryTrendsProps {
  records: WorkoutRecord[];
  dailyTrends: DayMetrics[];
}

interface UseCategoryTrendsReturn {
  categoryAnalysis: {
    day: string;
    category: string;
    maxWeight: number;
    message: string;
    trend: number;
  };
  isLoading: boolean;
}

/**
 * Hook para analizar tendencias de peso máximo por categoría de ejercicio
 */
export const useCategoryTrends = ({ records, dailyTrends }: UseCategoryTrendsProps): UseCategoryTrendsReturn => {
  const categoryAnalysis = useMemo(() => {
    if (!records || records.length === 0 || !dailyTrends || dailyTrends.length === 0) {
      return {
        day: 'N/A',
        category: 'N/A',
        maxWeight: 0,
        message: 'Sin datos suficientes',
        trend: 0,
      };
    }

    // Filtrar solo días que tengan entrenamientos
    const daysWithData = dailyTrends.filter(day => day.workouts > 0);

    if (daysWithData.length === 0) {
      return {
        day: 'N/A',
        category: 'N/A',
        maxWeight: 0,
        message: 'No hay días con entrenamientos registrados',
        trend: 0,
      };
    }

    return analyzeMaxWeightByCategory(records, daysWithData);
  }, [records, dailyTrends]);

  const isLoading = !records || records.length === 0;

  return {
    categoryAnalysis,
    isLoading,
  };
};
