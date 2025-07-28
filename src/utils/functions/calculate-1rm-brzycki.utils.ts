import { ONE_RM_CONSTANTS } from "@/constants/prediction-utils.constants";

/**
 * Calcula el 1RM usando la fórmula de Brzycki (alternativa más precisa para altas repeticiones)
 * Fórmula: peso / (1.0278 - 0.0278 * repeticiones)
 * Válida para 2-20 repeticiones
 */
export const calculate1RMBrzycki = (weight: number, reps: number): number => {
  if (weight <= 0 || reps <= 1) return weight; // Para 1 rep, el 1RM es el peso mismo
  const cappedReps = Math.min(reps, ONE_RM_CONSTANTS.MAX_REPS_FOR_1RM);
  const denominator = ONE_RM_CONSTANTS.BRZYCKI_A - (ONE_RM_CONSTANTS.BRZYCKI_B * cappedReps);
  return denominator > 0 ? weight / denominator : weight;
};