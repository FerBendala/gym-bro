import type { WorkoutRecord } from '@/interfaces';
import { isWithinInterval } from 'date-fns';

export const calculateWeeklyVolume = (records: WorkoutRecord[], start: Date, end: Date): number => {
  return records
    .filter(r => isWithinInterval(new Date(r.date), { start, end }))
    .reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0);
};


