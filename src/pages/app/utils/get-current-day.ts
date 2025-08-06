import { DAY_MAP } from '../constants';

import type { DayOfWeek } from '@/interfaces';

export const getCurrentDayInfo = (): DayOfWeek => {
  const today = new Date().toLocaleDateString('es-ES', { weekday: 'long' }).toLowerCase();
  return (DAY_MAP[today] as DayOfWeek) || 'lunes';
};
