import type { WorkoutRecord } from '@/interfaces';
import { useMemo } from 'react';

interface UseRecentWorkoutsProps {
  records: WorkoutRecord[];
  maxRecords?: number;
}

interface UseRecentWorkoutsReturn {
  displayRecords: WorkoutRecord[];
  hasRecords: boolean;
  isAtLimit: boolean;
  recordCount: number;
  maxRecords: number;
}

/**
 * Hook específico para la lógica de RecentWorkouts
 * Maneja límites, filtrado y estado de los registros
 */
export const useRecentWorkouts = ({
  records,
  maxRecords = 10
}: UseRecentWorkoutsProps): UseRecentWorkoutsReturn => {
  const displayRecords = useMemo(() => {
    return records.slice(0, maxRecords);
  }, [records, maxRecords]);

  const hasRecords = records.length > 0;
  const isAtLimit = records.length >= maxRecords;
  const recordCount = records.length;

  return {
    displayRecords,
    hasRecords,
    isAtLimit,
    recordCount,
    maxRecords
  };
}; 