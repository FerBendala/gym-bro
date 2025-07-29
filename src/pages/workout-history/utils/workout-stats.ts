import type { WorkoutRecordWithExercise } from '../types';

export interface WorkoutStats {
  totalSets: number;
  totalReps: number;
  totalVolume: number;
  avgWeight: number;
  maxWeight: number;
  minWeight: number;
}

export const calculateWorkoutStats = (record: WorkoutRecordWithExercise): WorkoutStats => {
  const hasIndividualSets = record.individualSets && record.individualSets.length > 0;

  if (hasIndividualSets) {
    const totalSets = record.individualSets!.length;
    const totalReps = record.individualSets!.reduce((sum, set) => sum + set.reps, 0);
    const totalVolume = record.individualSets!.reduce((sum, set) => sum + (set.weight * set.reps), 0);
    const avgWeight = record.individualSets!.reduce((sum, set) => sum + set.weight, 0) / totalSets;
    const maxWeight = Math.max(...record.individualSets!.map(set => set.weight));
    const minWeight = Math.min(...record.individualSets!.map(set => set.weight));

    return {
      totalSets,
      totalReps,
      totalVolume,
      avgWeight,
      maxWeight,
      minWeight,
    };
  } else {
    const volume = record.weight * record.reps * record.sets;

    return {
      totalSets: record.sets,
      totalReps: record.reps * record.sets,
      totalVolume: volume,
      avgWeight: record.weight,
      maxWeight: record.weight,
      minWeight: record.weight,
    };
  }
};

export const hasIndividualSets = (record: WorkoutRecordWithExercise): boolean => {
  return !!(record.individualSets && record.individualSets.length > 0);
};
