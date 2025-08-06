import { isValidRecord } from './is-valid-record.utils';

import type { WorkoutRecord } from '@/interfaces';

/**
 * Filtra registros válidos y los ordena cronológicamente
 */
export const getValidSortedRecords = (records: WorkoutRecord[]): WorkoutRecord[] => {
  return records
    .filter(isValidRecord)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};
