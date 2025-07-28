import { ONE_RM_CONSTANTS } from "@/constants/prediction-utils.constants";

/**
 * Calcula el 1RM usando la fórmula de Epley (estándar de la industria)
 * Fórmula: peso * (1 + repeticiones/30)
 * Válida para 1-20 repeticiones
 */
export const calculate1RMEpley = (weight: number, reps: number): number => {
  if (weight <= 0 || reps <= 0) return 0;
  const cappedReps = Math.min(reps, ONE_RM_CONSTANTS.MAX_REPS_FOR_1RM);
  return weight * (1 + cappedReps / ONE_RM_CONSTANTS.EPLEY_FACTOR);
};