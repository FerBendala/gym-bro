import type { WorkoutRecord } from '@/interfaces';
import { calculateOptimal1RM } from './calculate-1rm.utils';
import { calculateVolume } from './volume-calculations';

/**
 * Calcula la progresión de peso para una categoría
 */
export const calculateWeightProgression = (categoryRecords: WorkoutRecord[], targetCategory?: string): number => {
  if (categoryRecords.length < 2) return 0;

  // Filtrar por categoría si se especifica
  const filteredRecords = targetCategory
    ? categoryRecords.filter(r => r.exercise?.categories?.includes(targetCategory))
    : categoryRecords;

  if (filteredRecords.length < 2) return 0;

  // Ordenar por fecha
  const sortedRecords = [...filteredRecords].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Dividir en dos períodos
  const midpoint = Math.floor(sortedRecords.length / 2);
  const firstHalf = sortedRecords.slice(0, midpoint);
  const secondHalf = sortedRecords.slice(midpoint);

  if (firstHalf.length === 0 || secondHalf.length === 0) return 0;

  // Calcular 1RM promedio de cada período
  const firstHalf1RMs = firstHalf.map(r => calculateOptimal1RM(r.weight, r.reps));
  const secondHalf1RMs = secondHalf.map(r => calculateOptimal1RM(r.weight, r.reps));

  const firstHalfAvg = firstHalf1RMs.reduce((sum, orm) => sum + orm, 0) / firstHalf1RMs.length;
  const secondHalfAvg = secondHalf1RMs.reduce((sum, orm) => sum + orm, 0) / secondHalf1RMs.length;

  if (firstHalfAvg === 0) return 0;

  return ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;
};

/**
 * Calcula la progresión de volumen para una categoría
 */
export const calculateVolumeProgression = (categoryRecords: WorkoutRecord[], targetCategory?: string): number => {
  if (categoryRecords.length < 2) return 0;

  // Filtrar por categoría si se especifica
  const filteredRecords = targetCategory
    ? categoryRecords.filter(r => r.exercise?.categories?.includes(targetCategory))
    : categoryRecords;

  if (filteredRecords.length < 2) return 0;

  // Ordenar por fecha
  const sortedRecords = [...filteredRecords].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Dividir en dos períodos
  const midpoint = Math.floor(sortedRecords.length / 2);
  const firstHalf = sortedRecords.slice(0, midpoint);
  const secondHalf = sortedRecords.slice(midpoint);

  if (firstHalf.length === 0 || secondHalf.length === 0) return 0;

  // Calcular volumen promedio de cada período
  const firstHalfVolume = firstHalf.reduce((sum, r) => sum + calculateVolume(r), 0) / firstHalf.length;
  const secondHalfVolume = secondHalf.reduce((sum, r) => sum + calculateVolume(r), 0) / secondHalf.length;

  if (firstHalfVolume === 0) return 0;

  return ((secondHalfVolume - firstHalfVolume) / firstHalfVolume) * 100;
};

/**
 * Calcula la tasa de progresión general
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