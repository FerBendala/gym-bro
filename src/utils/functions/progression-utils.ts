import type { WorkoutRecord } from '@/interfaces';

/**
 * Calcula la tasa de progresión general
 * NOTA: Las funciones calculateWeightProgression y calculateVolumeProgression 
 * se han movido a sus propios archivos para evitar duplicación
 */
export const calculateProgressionRate = (records: WorkoutRecord[]): number => {
  if (records.length < 2) return 0;

  const sortedRecords = [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const firstHalf = sortedRecords.slice(0, Math.floor(sortedRecords.length / 2));
  const secondHalf = sortedRecords.slice(Math.floor(sortedRecords.length / 2));

  const firstAvg = firstHalf.reduce((sum, r) => sum + r.weight, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, r) => sum + r.weight, 0) / secondHalf.length;

  return firstAvg > 0 ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0;
}; 