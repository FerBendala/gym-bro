/**
 * Calcula el 1RM estimado usando la fórmula de Brzycki
 */
export const calculateEstimated1RM = (weight: number, reps: number): number => {
  if (reps === 1) return weight;
  if (reps > 30) return weight; // Para reps muy altas, usar el peso directamente
  return weight * (36 / (37 - reps));
}; 