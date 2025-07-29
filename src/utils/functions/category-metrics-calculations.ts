import type { WorkoutRecord } from '@/interfaces';
import { calculateVolume } from './volume-calculations';

/**
 * Calcula el número de récords personales en una categoría
 */
export const calculatePersonalRecords = (categoryRecords: WorkoutRecord[]): number => {
  if (categoryRecords.length === 0) return 0;

  const prCount = new Set();
  const sortedRecords = [...categoryRecords].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let currentMax = 0;
  sortedRecords.forEach(record => {
    if (record.weight > currentMax) {
      currentMax = record.weight;
      prCount.add(record.id);
    }
  });

  return prCount.size;
};

// Función calculateWeightProgression movida a calculate-weight-progression.ts para evitar duplicación

// Función calculateVolumeProgression movida a calculate-volume-progression.ts para evitar duplicación

// Función calculateIntensityScore movida a calculate-intensity-score.ts para evitar duplicación

/**
 * Calcula el score de eficiencia para una categoría
 */
export const calculateEfficiencyScore = (categoryRecords: WorkoutRecord[]): number => {
  if (categoryRecords.length === 0) return 0;

  const totalVolume = categoryRecords.reduce((sum, r) => sum + calculateVolume(r), 0);
  const totalSets = categoryRecords.reduce((sum, r) => sum + r.sets, 0);

  if (totalSets === 0) return 0;

  const volumePerSet = totalVolume / totalSets;

  // Normalizar a un score de 0-100 (ajustar según tus métricas)
  return Math.round(Math.min(100, volumePerSet / 10));
};