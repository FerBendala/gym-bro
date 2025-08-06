import { calculateOptimal1RM } from './calculate-1rm.utils';
import { calculateVolume } from './volume-calculations';
import { getLastCompleteWeekRecords } from './week-records.utils';
import { getMaxWeight } from './workout-utils';

import type { WorkoutRecord } from '@/interfaces';

/**
 * Calcula métricas básicas de los registros
 */
export const calculateBasicMetrics = (validRecords: WorkoutRecord[]) => {
  const totalVolume = validRecords.reduce((sum, r) => sum + calculateVolume(r), 0);
  const maxWeight = getMaxWeight(validRecords);
  const avgWeight = validRecords.reduce((sum, r) => sum + r.weight, 0) / validRecords.length;
  const avgVolume = totalVolume / validRecords.length;

  // OPCIÓN A: Usar última semana completa (excluyendo semana actual)
  const lastCompleteWeekRecords = getLastCompleteWeekRecords(validRecords);

  let current1RMMax = 0;
  if (lastCompleteWeekRecords.length > 0) {
    // Usar 1RM promedio de la última semana completa
    const lastWeek1RMs = lastCompleteWeekRecords.map(r => calculateOptimal1RM(r.weight, r.reps));
    current1RMMax = lastWeek1RMs.reduce((sum, rm) => sum + rm, 0) / lastWeek1RMs.length;
  } else {
    // Fallback: si no hay semana completa anterior, usar últimos 5 entrenamientos
    const recentRecords = validRecords.slice(-5);
    if (recentRecords.length > 0) {
      const recent1RMs = recentRecords.map(r => calculateOptimal1RM(r.weight, r.reps));
      current1RMMax = recent1RMs.reduce((sum, rm) => sum + rm, 0) / recent1RMs.length;
    }
  }

  return {
    totalVolume,
    avgWeight,
    maxWeight,
    avgVolume,
    current1RMMax,
  };
};
