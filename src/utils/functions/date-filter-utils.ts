import type { WorkoutRecord } from '@/interfaces';
import { differenceInDays } from 'date-fns';

/**
 * Utilidades centralizadas para filtrado de registros por fecha
 * Elimina duplicación de patrones en +6 archivos
 */

/**
 * Filtra registros por rango de días desde hoy
 * Patrón usado +6 veces: records.filter(r => differenceInDays(now, new Date(r.date)) <= days)
 */
export const filterRecordsByDaysFromToday = (
  records: WorkoutRecord[],
  days: number
): WorkoutRecord[] => {
  const now = new Date();
  return records.filter(r => {
    const daysDiff = differenceInDays(now, new Date(r.date));
    return daysDiff >= 0 && daysDiff <= days;
  });
};

/**
 * Filtra registros por rango de días específico
 * Patrón usado +4 veces: records.filter(r => daysDiff >= minDays && daysDiff <= maxDays)
 */
export const filterRecordsByDayRange = (
  records: WorkoutRecord[],
  minDays: number,
  maxDays: number
): WorkoutRecord[] => {
  const now = new Date();
  return records.filter(r => {
    const daysDiff = differenceInDays(now, new Date(r.date));
    return daysDiff >= minDays && daysDiff <= maxDays;
  });
};

/**
 * Filtra registros por período de tiempo (desde fecha hasta hoy)
 * Patrón usado +3 veces: records.filter(r => new Date(r.date) >= startDate)
 */
export const filterRecordsByDateRange = (
  records: WorkoutRecord[],
  startDate: Date,
  endDate?: Date
): WorkoutRecord[] => {
  const end = endDate || new Date();
  return records.filter(r => {
    const recordDate = new Date(r.date);
    return recordDate >= startDate && recordDate <= end;
  });
};

/**
 * Filtra registros por semana específica
 * Patrón usado +2 veces: records.filter(r => isSameWeek(new Date(r.date), targetWeek))
 */
export const filterRecordsByWeek = (
  records: WorkoutRecord[],
  targetWeek: Date
): WorkoutRecord[] => {
  const startOfWeek = new Date(targetWeek);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 6);

  return filterRecordsByDateRange(records, startOfWeek, endOfWeek);
};

/**
 * Filtra registros por mes específico
 * Patrón usado +2 veces: records.filter(r => isSameMonth(new Date(r.date), targetMonth))
 */
export const filterRecordsByMonth = (
  records: WorkoutRecord[],
  targetMonth: Date
): WorkoutRecord[] => {
  const startOfMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1);
  const endOfMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0);

  return filterRecordsByDateRange(records, startOfMonth, endOfMonth);
};

/**
 * Divide registros en dos períodos cronológicos
 * Patrón usado +2 veces: records.filter(r => new Date(r.date).getTime() <= midpointTime)
 */
export const splitRecordsByChronologicalMidpoint = (
  records: WorkoutRecord[]
): { firstHalf: WorkoutRecord[]; secondHalf: WorkoutRecord[] } => {
  if (records.length === 0) {
    return { firstHalf: [], secondHalf: [] };
  }

  const sortedRecords = [...records].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const totalTime = new Date(sortedRecords[sortedRecords.length - 1].date).getTime() -
    new Date(sortedRecords[0].date).getTime();
  const midpointTime = new Date(sortedRecords[0].date).getTime() + (totalTime / 2);

  const firstHalf = sortedRecords.filter(r => new Date(r.date).getTime() <= midpointTime);
  const secondHalf = sortedRecords.filter(r => new Date(r.date).getTime() > midpointTime);

  return { firstHalf, secondHalf };
};

/**
 * Filtra registros por día de la semana
 * Patrón usado +1 vez: records.filter(r => getDay(new Date(r.date)) === dayIndex)
 */
export const filterRecordsByDayOfWeek = (
  records: WorkoutRecord[],
  dayIndex: number
): WorkoutRecord[] => {
  return records.filter(r => {
    const day = new Date(r.date).getDay();
    return day === dayIndex;
  });
};

/**
 * Obtiene registros de hoy
 * Patrón usado +1 vez: records.filter(record => isDateToday(record.date))
 */
export const filterRecordsFromToday = (records: WorkoutRecord[]): WorkoutRecord[] => {
  const today = new Date();
  return records.filter(r => {
    const recordDate = new Date(r.date);
    return recordDate.toDateString() === today.toDateString();
  });
};