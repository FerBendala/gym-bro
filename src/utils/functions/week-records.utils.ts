import type { WorkoutRecord } from '@/interfaces';
import { endOfWeek, startOfWeek, subWeeks } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Obtiene registros de esta semana (lunes a domingo)
 */
export const getThisWeekRecords = (records: WorkoutRecord[]): WorkoutRecord[] => {
  const now = new Date();
  const weekStart = startOfWeek(now, { locale: es }); // Lunes
  const weekEnd = endOfWeek(now, { locale: es }); // Domingo

  return records.filter(record => {
    const recordDate = new Date(record.date);
    return recordDate >= weekStart && recordDate <= weekEnd;
  });
};

/**
 * Obtiene registros de la semana pasada (lunes a domingo)
 */
export const getLastWeekRecords = (records: WorkoutRecord[]): WorkoutRecord[] => {
  const now = new Date();
  const lastWeekStart = startOfWeek(subWeeks(now, 1), { locale: es }); // Lunes semana pasada
  const lastWeekEnd = endOfWeek(lastWeekStart, { locale: es }); // Domingo semana pasada

  return records.filter(record => {
    const recordDate = new Date(record.date);
    return recordDate >= lastWeekStart && recordDate <= lastWeekEnd;
  });
};

/**
 * Obtiene registros de la última semana completa (excluyendo la semana actual)
 */
export const getLastCompleteWeekRecords = (records: WorkoutRecord[]): WorkoutRecord[] => {
  if (records.length === 0) return [];

  const weekGroups = new Map<string, WorkoutRecord[]>();
  const now = new Date();

  records.forEach(record => {
    const date = new Date(record.date);
    const weekStart = startOfWeek(date, { locale: es });
    const weekKey = weekStart.toISOString().split('T')[0];

    if (!weekGroups.has(weekKey)) {
      weekGroups.set(weekKey, []);
    }
    weekGroups.get(weekKey)!.push(record);
  });

  // Ordenar semanas por fecha y excluir la semana actual
  const sortedWeeks = Array.from(weekGroups.entries())
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .filter(([weekKey]) => {
      const weekStart = new Date(weekKey);
      const currentWeekStart = startOfWeek(now, { locale: es });
      return weekStart.getTime() < currentWeekStart.getTime();
    });

  // Devolver registros de la última semana completa
  return sortedWeeks.length > 0 ? sortedWeeks[sortedWeeks.length - 1][1] : [];
}; 