import { THEME_CALENDAR } from '@/constants/theme/index.constants';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths
} from 'date-fns';
import { es } from 'date-fns/locale';
import type { WorkoutRecord } from '../../interfaces';

/**
 * Utilidades genéricas para calendarios
 * Reutilizable en WorkoutCalendar, EventCalendar, DatePicker, etc.
 */

export interface CalendarData {
  days: Date[];
  monthStart: Date;
  monthEnd: Date;
  calendarStart: Date;
  calendarEnd: Date;
}

export interface CalendarDayData {
  date: Date;
  dayNumber: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  workouts: WorkoutRecord[];
  intensity: string;
  hasData: boolean;
}

export interface CalendarStats {
  daysWithWorkouts: number;
  totalWorkouts: number;
}

/**
 * Calcula los días que deben mostrarse en el calendario para un mes dado
 */
export const getCalendarDays = (date: Date): CalendarData => {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const calendarStart = startOfWeek(monthStart, { locale: es });
  const calendarEnd = endOfWeek(monthEnd, { locale: es });

  const days = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd
  });

  return {
    days,
    monthStart,
    monthEnd,
    calendarStart,
    calendarEnd
  };
};

/**
 * Agrupa los entrenamientos por día en formato de objeto indexado
 */
export const groupWorkoutsByDay = (records: WorkoutRecord[]): Record<string, WorkoutRecord[]> => {
  return records.reduce((acc, record) => {
    const dateKey = format(record.date, 'yyyy-MM-dd');
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(record);
    return acc;
  }, {} as Record<string, WorkoutRecord[]>);
};

/**
 * Obtiene los entrenamientos para un día específico
 */
export const getWorkoutsForDay = (
  date: Date,
  workoutsByDay: Record<string, WorkoutRecord[]>
): WorkoutRecord[] => {
  const dateKey = format(date, 'yyyy-MM-dd');
  return workoutsByDay[dateKey] || [];
};

/**
 * Calcula la intensidad de color basada en la cantidad de entrenamientos
 * Devuelve string vacío para días sin entrenamientos
 */
export const getIntensityColor = (workoutCount: number): string => {
  // Días sin entrenamientos no deben tener fondo
  if (workoutCount === 0) {
    return '';
  }

  // Encontrar el nivel apropiado para días con entrenamientos
  const level = THEME_CALENDAR.intensityLevels.find(
    level => workoutCount <= level.threshold && level.threshold > 0
  );
  return level?.className || THEME_CALENDAR.intensity.veryHigh;
};

/**
 * Genera la información completa para un día del calendario
 */
export const getDayData = (
  day: Date,
  currentDate: Date,
  workoutsByDay: Record<string, WorkoutRecord[]>
): CalendarDayData => {
  const workouts = getWorkoutsForDay(day, workoutsByDay);
  const today = new Date();

  return {
    date: day,
    dayNumber: format(day, 'd'),
    isCurrentMonth: isSameMonth(day, currentDate),
    isToday: isSameDay(day, today),
    workouts,
    intensity: getIntensityColor(workouts.length),
    hasData: workouts.length > 0
  };
};

/**
 * Calcula las estadísticas del mes actual
 */
export const getMonthStats = (
  records: WorkoutRecord[],
  currentDate: Date,
  workoutsByDay: Record<string, WorkoutRecord[]>
): CalendarStats => {
  // Días con entrenamientos en el mes actual
  const daysWithWorkouts = Object.keys(workoutsByDay).filter(dateKey => {
    const recordDate = new Date(dateKey);
    return isSameMonth(recordDate, currentDate);
  }).length;

  // Total de entrenamientos en el mes actual
  const totalWorkouts = records.filter(record =>
    isSameMonth(record.date, currentDate)
  ).length;

  return {
    daysWithWorkouts,
    totalWorkouts
  };
};

/**
 * Formatea la fecha para el header del calendario
 */
export const formatCalendarHeader = (date: Date): string => {
  return format(date, 'MMMM yyyy', { locale: es });
};

/**
 * Navega al mes anterior
 */
export const navigateToPreviousMonth = (currentDate: Date): Date => {
  return subMonths(currentDate, 1);
};

/**
 * Navega al mes siguiente
 */
export const navigateToNextMonth = (currentDate: Date): Date => {
  return addMonths(currentDate, 1);
};

/**
 * Genera el título de tooltip para un día con entrenamientos
 */
export const getDayTooltip = (workoutCount: number): string => {
  if (workoutCount === 0) return '';
  return `${workoutCount} entrenamientos`;
};

/**
 * Genera los datos de la leyenda de intensidad
 * Solo incluye niveles para días con entrenamientos
 */
export const getLegendData = () => {
  return [
    { intensity: 'low', className: THEME_CALENDAR.intensity.low },
    { intensity: 'medium', className: THEME_CALENDAR.intensity.medium },
    { intensity: 'high', className: THEME_CALENDAR.intensity.high },
    { intensity: 'veryHigh', className: THEME_CALENDAR.intensity.veryHigh }
  ];
};

/**
 * Verifica si una fecha es válida
 */
export const isValidDate = (date: any): boolean => {
  return date instanceof Date && !isNaN(date.getTime());
};

/**
 * Obtiene la fecha actual sin hora
 */
export const getTodayDate = (): Date => {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), today.getDate());
};

/**
 * Calcula el rango de fechas visibles en el calendario
 */
export const getVisibleDateRange = (currentDate: Date): { start: Date; end: Date } => {
  const { calendarStart, calendarEnd } = getCalendarDays(currentDate);
  return { start: calendarStart, end: calendarEnd };
};

/**
 * Obtiene la lista de días de la semana localizados
 */
export const getWeekdayLabels = (): readonly string[] => {
  return THEME_CALENDAR.weekdayLabels;
}; 