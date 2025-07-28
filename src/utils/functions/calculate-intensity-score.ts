import type { WorkoutRecord } from '@/interfaces';

/**
 * Calcula el score de intensidad para una categoría
 */
export const calculateIntensityScore = (categoryRecords: WorkoutRecord[]): number => {
  if (categoryRecords.length === 0) return 0;

  // Calcular 1RM estimado para cada registro
  const oneRMs = categoryRecords.map(r => r.weight * (1 + Math.min(r.reps, 20) / 30));

  const maxOneRM = Math.max(...oneRMs);
  const avgOneRM = oneRMs.reduce((sum, orm) => sum + orm, 0) / oneRMs.length;

  if (maxOneRM === 0) return 0;

  // Intensidad basada en % de 1RM (más precisa)
  const intensityPercentage = (avgOneRM / maxOneRM) * 100;
  return Math.round(intensityPercentage);
}; 