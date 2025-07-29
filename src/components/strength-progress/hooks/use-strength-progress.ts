import { useMemo } from 'react';

import type { StrengthProgressAnalysis } from '../types';

import type { WorkoutRecord } from '@/interfaces';
import { calculateAdvancedStrengthAnalysis } from '@/utils';

export const useStrengthProgress = (records: WorkoutRecord[]): StrengthProgressAnalysis | null => {
  return useMemo(() => {
    if (records.length === 0) {
      return null;
    }

    return calculateAdvancedStrengthAnalysis(records);
  }, [records]);
};
