import type { ExerciseAssignment } from '../../interfaces';
import { normalizeByWeekday } from './normalize-by-weekday';

/**
 * Normaliza tendencias de volumen considerando el día de la semana
 * ESENCIAL: Corrige el problema de "tendencia negativa falsa" los lunes
 */
export const normalizeVolumeTrend = (
  thisWeekVolume: number,
  lastWeekVolume: number,
  currentDate: Date = new Date(),
  allAssignments?: ExerciseAssignment[]
): number => {
  const { normalizedCurrent, normalizedComparison } = normalizeByWeekday(
    thisWeekVolume,
    lastWeekVolume,
    currentDate,
    allAssignments
  );

  if (normalizedComparison === 0) return 0;

  return ((normalizedCurrent - normalizedComparison) / normalizedComparison) * 100;
}; 