import type { ExerciseAssignment, WorkoutRecord } from '@/interfaces';
import { endOfMonth, endOfWeek, startOfMonth, startOfWeek, subMonths, subWeeks } from 'date-fns';
import { es } from 'date-fns/locale';
import { getCurrentDateFromRecords } from './get-current-date-from-records';
import { normalizeByWeekday } from './normalize-by-weekday';
import { normalizeVolumeTrend } from './normalize-volume-trend';

/**
 * Calcula la distribución de volumen temporal para una categoría
 * MEJORADO: Incluye normalización por día de la semana para comparaciones justas
 */
export const calculateVolumeDistribution = (categoryRecords: WorkoutRecord[], allRecords?: WorkoutRecord[], allAssignments?: ExerciseAssignment[]): {
  thisWeek: number;
  lastWeek: number;
  thisMonth: number;
  lastMonth: number;
  // Valores normalizados para comparaciones justas
  thisWeekNormalized: number;
  weekdayFactor: number;
  volumeTrend: number; // Tendencia normalizada
} => {
  // Usar la fecha actual basada en los datos reales
  const now = getCurrentDateFromRecords(allRecords || categoryRecords);

  // Usar date-fns con locale español para consistencia
  const thisWeekStart = startOfWeek(now, { locale: es });
  const thisWeekEnd = endOfWeek(now, { locale: es });

  const lastWeekStart = startOfWeek(subWeeks(now, 1), { locale: es });
  const lastWeekEnd = endOfWeek(subWeeks(now, 1), { locale: es });

  // Usar funciones de date-fns para meses reales del calendario
  const thisMonthStart = startOfMonth(now);
  const thisMonthEnd = endOfMonth(now);

  const lastMonthStart = startOfMonth(subMonths(now, 1));
  const lastMonthEnd = endOfMonth(subMonths(now, 1));

  const thisWeekRecords = categoryRecords.filter(r => {
    const date = new Date(r.date);
    return date >= thisWeekStart && date <= thisWeekEnd;
  });

  const lastWeekRecords = categoryRecords.filter(r => {
    const date = new Date(r.date);
    return date >= lastWeekStart && date <= lastWeekEnd;
  });

  const thisMonthRecords = categoryRecords.filter(r => {
    const date = new Date(r.date);
    return date >= thisMonthStart && date <= thisMonthEnd;
  });

  const lastMonthRecords = categoryRecords.filter(r => {
    const date = new Date(r.date);
    return date >= lastMonthStart && date <= lastMonthEnd;
  });

  // Calcular volúmenes base
  const thisWeekVolume = thisWeekRecords.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0);
  const lastWeekVolume = lastWeekRecords.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0);

  // **MEJORA CRÍTICA**: Normalizar volumen de esta semana por día actual
  const { normalizedCurrent: thisWeekNormalized, weekdayFactor } = normalizeByWeekday(
    thisWeekVolume,
    lastWeekVolume,
    now,
    allAssignments
  );

  // Calcular tendencia normalizada
  const volumeTrend = normalizeVolumeTrend(thisWeekVolume, lastWeekVolume, now, allAssignments);

  return {
    thisWeek: thisWeekVolume,
    lastWeek: lastWeekVolume,
    thisMonth: thisMonthRecords.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0),
    lastMonth: lastMonthRecords.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0),
    // Nuevos valores normalizados
    thisWeekNormalized: Math.round(thisWeekNormalized),
    weekdayFactor,
    volumeTrend: Math.round(volumeTrend)
  };
}; 