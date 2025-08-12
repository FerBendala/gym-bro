import type { WorkoutRecord } from '@/interfaces';
import { getCategoryFromExercise } from '@/utils/functions/exercise-categories.utils';
import { isWithinInterval } from 'date-fns';

export interface CategoryVolumeResult {
  totalVolume: number;
  workouts: number;
}

export const calcCategoryVolume = (
  records: WorkoutRecord[],
  category: string,
  start: Date,
  end: Date,
): CategoryVolumeResult => {
  let total = 0;
  let count = 0;
  for (const r of records) {
    if (!isWithinInterval(new Date(r.date), { start, end })) continue;
    const cat = r.exercise?.categories?.[0] || getCategoryFromExercise(r.exerciseId);
    if (cat === category) {
      total += r.weight * r.reps * r.sets;
      count += 1;
    }
  }
  return { totalVolume: total, workouts: count };
};


