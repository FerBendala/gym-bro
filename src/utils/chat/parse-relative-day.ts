import { addDays, endOfDay, startOfDay } from 'date-fns';

export interface DayWindow {
  start: Date;
  end: Date;
  label: string;
}

export const parseRelativeDay = (text: string): DayWindow | null => {
  const q = text.toLowerCase();
  const now = new Date();
  if (q.includes('ayer')) {
    const d = addDays(now, -1);
    return { start: startOfDay(d), end: endOfDay(d), label: 'ayer' };
  }
  if (q.includes('mañana') || q.includes('manana')) {
    const d = addDays(now, 1);
    return { start: startOfDay(d), end: endOfDay(d), label: 'mañana' };
  }
  if (q.includes('hoy')) {
    return { start: startOfDay(now), end: endOfDay(now), label: 'hoy' };
  }
  return null;
};



