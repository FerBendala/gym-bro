/**
 * Calcula el 1RM estimado usando la fórmula de Epley
 * 1RM = peso × (1 + repeticiones/30)
 */
export const calculateEstimated1RMStats = (weight: number, reps: number): number => {
  if (weight === 0 || reps === 0) return 0;
  // Limitar repeticiones a máximo 20 para evitar estimaciones irreales
  const adjustedReps = Math.min(reps, 20);
  return weight * (1 + adjustedReps / 30);
};