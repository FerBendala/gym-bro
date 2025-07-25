import { DAYS } from '@/constants/days';
import type { DayOfWeek } from '@/interfaces';
import type { DayInfo } from '../types';

/**
 * Obtiene información del día actual
 */
export const getCurrentDayInfo = (activeDay: DayOfWeek): DayInfo => {
  const today = new Date().toLocaleDateString('es-ES', { weekday: 'long' }).toLowerCase();
  const isToday = activeDay === today;
  const dayIndex = DAYS.indexOf(activeDay);

  return {
    isToday,
    dayIndex,
    formattedDate: new Date().toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  };
};

/**
 * Verifica si un día es el día actual
 */
export const isCurrentDay = (day: DayOfWeek): boolean => {
  return day === new Date().toLocaleDateString('es-ES', { weekday: 'long' }).toLowerCase();
};

/**
 * Formatea el nombre del día para mostrar
 */
export const formatDayName = (day: DayOfWeek): string => {
  return day.charAt(0).toUpperCase() + day.slice(1);
};

/**
 * Obtiene la abreviatura del día (3 letras)
 */
export const getDayAbbreviation = (day: DayOfWeek): string => {
  return day.slice(0, 3).toUpperCase();
}; 