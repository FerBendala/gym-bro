import { useTrendsAnalysis } from '@/hooks/use-advanced-analysis';
import type { WorkoutRecord } from '@/interfaces';
import { useMemo } from 'react';

export const useTrendsContent = (records: WorkoutRecord[]) => {
  // ✅ USAR HOOK CENTRALIZADO: Evita duplicación de análisis de tendencias
  const analysis = useTrendsAnalysis(records);

  const trendsData = useMemo(() => {
    if (records.length === 0) {
      return {
        dailyTrends: [],
        weeklyTrends: [],
        monthlyTrends: [],
        overallStats: {
          totalWorkouts: 0,
          totalVolume: 0,
          avgWeight: 0,
          maxWeight: 0
        }
      };
    }

    return {
      dailyTrends: analysis.dayMetricsOrdered || [],
      weeklyTrends: analysis.temporalTrends || [],
      monthlyTrends: [],
      overallStats: analysis.overallStats || {
        totalWorkouts: records.length,
        totalVolume: records.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0),
        avgWeight: records.reduce((sum, r) => sum + r.weight, 0) / records.length,
        maxWeight: Math.max(...records.map(r => r.weight))
      }
    };
  }, [records, analysis]);

  return {
    analysis,
    trendsData
  };
};