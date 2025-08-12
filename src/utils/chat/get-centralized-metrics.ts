import type { Exercise, WorkoutRecord } from '@/interfaces';
import { normalizeVolumeTrend } from '@/utils/functions/normalize-by-weekday';
import { predictProgress } from '@/utils/functions/predict-progress.utils';
import { endOfWeek, startOfWeek, subWeeks } from 'date-fns';
import { calculateWeeklyVolume } from './calculate-weekly-volume';

export interface CentralizedMetrics {
  strengthTrend: number;
  volumeTrend: number; // normalizado por día de semana
  monthlyGrowth: number;
  prWeight: number;
  prConfidence: number; // 0-100
  plateauRisk: number; // 0-100
  timeToNextPR: number;
  trendAnalysis: string;
}

// función movida a calculate-weekly-volume.ts para cumplir 1 función por archivo

export const getCentralizedMetrics = (records: WorkoutRecord[], _exercises: Exercise[]): CentralizedMetrics => {
  const prediction = predictProgress(records);

  // Volumen por semanas para normalización
  const now = new Date();
  const thisWeekStart = startOfWeek(now);
  const thisWeekEnd = endOfWeek(now);
  const lastWeekStart = startOfWeek(subWeeks(now, 1));
  const lastWeekEnd = endOfWeek(subWeeks(now, 1));

  const thisWeekVolume = calculateWeeklyVolume(records, thisWeekStart, thisWeekEnd);
  const lastWeekVolume = calculateWeeklyVolume(records, lastWeekStart, lastWeekEnd);

  const normalizedVolTrend = normalizeVolumeTrend(thisWeekVolume, lastWeekVolume, now);

  return {
    strengthTrend: prediction.strengthTrend,
    volumeTrend: normalizedVolTrend,
    monthlyGrowth: prediction.monthlyGrowthRate,
    prWeight: prediction.predictedPR.weight,
    prConfidence: prediction.predictedPR.confidence * 100,
    plateauRisk: prediction.plateauRisk,
    timeToNextPR: prediction.timeToNextPR,
    trendAnalysis: prediction.trendAnalysis,
  };
};


