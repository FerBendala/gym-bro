import { getExercises, getWorkoutRecords } from '@/api/services';
import type { Exercise, WorkoutRecord } from '@/interfaces';
import { predictProgress } from '@/utils/functions/predict-progress.utils';
import { getCentralizedMetrics } from './get-centralized-metrics';

export interface UserContext {
  records: WorkoutRecord[];
  exercises: Exercise[];
  summary: {
    workouts: number;
    lastWorkout?: Date;
  };
  predictionsText: string;
  // Índice de ejercicios se construye perezosamente en las herramientas
}

export const getUserContext = async (): Promise<UserContext> => {
  const [records, exercises] = await Promise.all([getWorkoutRecords(), getExercises()]);
  const predictions = predictProgress(records);
  const central = getCentralizedMetrics(records, exercises);

  const lastWorkout = records[0]?.date;
  const predictionsText = `Tendencia: fuerza ${central.strengthTrend.toFixed(2)}%, volumen ${central.volumeTrend.toFixed(2)}%; PR estimado ${central.prWeight.toFixed(1)}kg (confianza ${central.prConfidence.toFixed(0)}%); riesgo meseta ${central.plateauRisk.toFixed(0)}%`;

  return {
    records,
    exercises,
    summary: {
      workouts: records.length,
      lastWorkout,
    },
    predictionsText,
  };
};


