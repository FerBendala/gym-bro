import type { WorkoutRecord } from '@/interfaces';

/**
 * Función auxiliar para agrupar registros por semana
 */
export const groupRecordsByWeek = (records: WorkoutRecord[]): WorkoutRecord[][] => {
  const weekGroups: { [key: string]: WorkoutRecord[] } = {};

  records.forEach(record => {
    const date = new Date(record.date);
    const weekKey = `${date.getFullYear()}-W${getWeekNumber(date)}`;

    if (!weekGroups[weekKey]) {
      weekGroups[weekKey] = [];
    }
    weekGroups[weekKey].push(record);
  });

  return Object.values(weekGroups).sort((a, b) =>
    new Date(a[0].date).getTime() - new Date(b[0].date).getTime()
  );
};

/**
 * Función auxiliar para obtener el número de semana
 */
export const getWeekNumber = (date: Date): number => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
};

/**
 * Función auxiliar para verificar si dos fechas están en la misma semana
 */
export const isSameWeek = (date1: string, date2: string): boolean => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const week1 = getWeekNumber(d1);
  const week2 = getWeekNumber(d2);
  return d1.getFullYear() === d2.getFullYear() && week1 === week2;
}; 