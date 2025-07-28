import type { WorkoutRecord } from '@/interfaces';
import { calculateTemporalTrends } from './temporal-trends';

/**
 * Encuentra el mejor período de rendimiento
 */
export const findBestPerformancePeriod = (records: WorkoutRecord[]): string => {
  if (records.length === 0) return 'N/A';

  const trends = calculateTemporalTrends(records, 8);
  if (trends.length === 0) return 'N/A';

  const bestWeek = trends.reduce((best, current) =>
    current.volume > best.volume ? current : best
  );

  return `Semana del ${bestWeek.period}`;
}; 