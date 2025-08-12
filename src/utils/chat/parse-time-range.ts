import { endOfDay, startOfDay, subWeeks } from 'date-fns';

export interface ParsedRange {
  start: Date;
  end: Date;
  label: string;
}

export const parseTimeRange = (text: string): ParsedRange | null => {
  const q = text.toLowerCase();
  const now = new Date();
  if (q.includes('4') && q.includes('semana')) {
    const start = startOfDay(subWeeks(now, 4));
    const end = endOfDay(now);
    return { start, end, label: 'Últimas 4 semanas' };
  }
  if (q.includes('semana pasada')) {
    const start = startOfDay(subWeeks(now, 1));
    const end = endOfDay(subWeeks(now, 0));
    return { start, end, label: 'Semana pasada' };
  }
  return null;
};


