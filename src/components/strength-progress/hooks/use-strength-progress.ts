import type { WorkoutRecord } from '@/interfaces';
import { useMemo } from 'react';
import { calculateAdvancedStrengthAnalysis } from '../../../utils/functions';
import type { StrengthProgressAnalysis } from '../types';

export const useStrengthProgress = (records: WorkoutRecord[]): StrengthProgressAnalysis | null => {
  return useMemo(() => {
    if (records.length === 0) {
      return null;
    }

    return calculateAdvancedStrengthAnalysis(records);
  }, [records]);
}; 