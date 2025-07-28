/**
 * Utilidades para manejo de fechas, tiempo y calendario
 * Funciones puras para operaciones con fechas
 */

import type { WorkoutRecord } from '@/interfaces';
import { endOfWeek, format, isThisWeek, isToday, isYesterday, startOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';

export type TimeFilter = 'week' | 'month' | 'all';

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
 * Filtra registros por período de tiempo
 */
export const filterRecordsByTime = <T extends { date: Date }>(
  records: T[],
  timeFilter: TimeFilter
): T[] => {
  const now = new Date();

  switch (timeFilter) {
    case 'week': {
      const weekStart = startOfWeek(now, { locale: es });
      return records.filter(record => record.date >= weekStart);
    }

    case 'month': {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      return records.filter(record => record.date >= monthStart);
    }

    case 'all':
    default:
      return records;
  }
};

/**
 * Obtiene la etiqueta del filtro de tiempo
 */
export const getTimeFilterLabel = (timeFilter: TimeFilter, referenceDate?: Date): string => {
  const date = referenceDate || new Date();

  switch (timeFilter) {
    case 'week':
      return `Esta semana (${format(startOfWeek(date, { locale: es }), 'dd/MM', { locale: es })} - ${format(endOfWeek(date, { locale: es }), 'dd/MM', { locale: es })})`;
    case 'month':
      return `Este mes (${format(date, 'MMMM yyyy', { locale: es })})`;
    case 'all':
      return 'Todo el tiempo';
    default:
      return 'Período no especificado';
  }
};

/**
 * Formatea tiempo relativo
 */
export const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) return 'Ahora mismo';
  if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;
  if (diffInHours < 24) return `Hace ${diffInHours}h`;
  if (diffInDays < 7) return `Hace ${diffInDays} días`;

  return format(date, 'dd/MM/yyyy', { locale: es });
};

/**
 * Calcula diferencia en horas entre dos fechas
 */
export const getHoursDifference = (date1: Date, date2: Date): number => {
  return Math.abs(date1.getTime() - date2.getTime()) / (1000 * 60 * 60);
};

/**
 * Calcula diferencia en días entre dos fechas
 */
export const getDaysDifference = (date1: Date, date2: Date): number => {
  return Math.abs(date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24);
};

/**
 * Verifica si una fecha es hoy
 */
export const isDateToday = (date: Date): boolean => {
  return isToday(date);
};

/**
 * Verifica si una fecha es ayer
 */
export const isDateYesterday = (date: Date): boolean => {
  return isYesterday(date);
};

/**
 * Verifica si una fecha es esta semana
 */
export const isDateThisWeek = (date: Date): boolean => {
  return isThisWeek(date, { locale: es });
};

/**
 * Formatea fecha de forma compacta
 */
export const formatCompactDate = (date: Date): string => {
  if (isDateToday(date)) return 'Hoy';
  if (isDateYesterday(date)) return 'Ayer';
  if (isDateThisWeek(date)) return format(date, 'EEEE', { locale: es });

  return format(date, 'dd/MM', { locale: es });
};

/**
 * Obtiene los días del calendario para un mes
 */
export const getCalendarDays = (date: Date): CalendarData => {
  const year = date.getFullYear();
  const month = date.getMonth();

  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0);

  const calendarStart = startOfWeek(monthStart, { locale: es });
  const calendarEnd = endOfWeek(monthEnd, { locale: es });

  const days: Date[] = [];
  const current = new Date(calendarStart);

  while (current <= calendarEnd) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return {
    days,
    monthStart,
    monthEnd,
    calendarStart,
    calendarEnd
  };
};

/**
 * Agrupa entrenamientos por día
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
 * Obtiene entrenamientos para un día específico
 */
export const getWorkoutsForDay = (
  date: Date,
  workoutsByDay: Record<string, WorkoutRecord[]>
): WorkoutRecord[] => {
  const dateKey = format(date, 'yyyy-MM-dd');
  return workoutsByDay[dateKey] || [];
};

/**
 * Obtiene el color de intensidad basado en el número de entrenamientos
 */
export const getIntensityColor = (workoutCount: number): string => {
  if (workoutCount === 0) return 'bg-gray-100';
  if (workoutCount === 1) return 'bg-green-200';
  if (workoutCount === 2) return 'bg-green-400';
  if (workoutCount === 3) return 'bg-green-600';
  return 'bg-green-800';
};

/**
 * Obtiene datos completos de un día del calendario
 */
export const getDayData = (
  day: Date,
  currentDate: Date,
  workoutsByDay: Record<string, WorkoutRecord[]>
): CalendarDayData => {
  const workouts = getWorkoutsForDay(day, workoutsByDay);
  const workoutCount = workouts.length;

  return {
    date: day,
    dayNumber: format(day, 'd'),
    isCurrentMonth: day.getMonth() === currentDate.getMonth(),
    isToday: isDateToday(day),
    workouts,
    intensity: getIntensityColor(workoutCount),
    hasData: workoutCount > 0
  };
};

/**
 * Calcula estadísticas del mes
 */
export const getMonthStats = (
  records: WorkoutRecord[],
  currentDate: Date,
  workoutsByDay: Record<string, WorkoutRecord[]>
): CalendarStats => {
  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

  const monthRecords = records.filter(record =>
    record.date >= monthStart && record.date <= monthEnd
  );

  const daysWithWorkouts = Object.keys(workoutsByDay).filter(dateKey => {
    const date = new Date(dateKey);
    return date >= monthStart && date <= monthEnd && workoutsByDay[dateKey].length > 0;
  }).length;

  return {
    daysWithWorkouts,
    totalWorkouts: monthRecords.length
  };
};

/**
 * Formatea el encabezado del calendario
 */
export const formatCalendarHeader = (date: Date): string => {
  return format(date, 'MMMM yyyy', { locale: es });
};

/**
 * Navega al mes anterior
 */
export const navigateToPreviousMonth = (currentDate: Date): Date => {
  return new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
};

/**
 * Navega al mes siguiente
 */
export const navigateToNextMonth = (currentDate: Date): Date => {
  return new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
};

/**
 * Obtiene el tooltip para un día
 */
export const getDayTooltip = (workoutCount: number): string => {
  if (workoutCount === 0) return 'Sin entrenamientos';
  if (workoutCount === 1) return '1 entrenamiento';
  return `${workoutCount} entrenamientos`;
};

/**
 * Obtiene datos de la leyenda del calendario
 */
export const getLegendData = () => {
  return [
    { color: 'bg-gray-100', label: 'Sin entrenamientos' },
    { color: 'bg-green-200', label: '1 entrenamiento' },
    { color: 'bg-green-400', label: '2 entrenamientos' },
    { color: 'bg-green-600', label: '3 entrenamientos' },
    { color: 'bg-green-800', label: '4+ entrenamientos' }
  ];
};

/**
 * Valida si una fecha es válida
 */
export const isValidDate = (date: unknown): boolean => {
  return date instanceof Date && !isNaN(date.getTime());
};

/**
 * Obtiene la fecha actual
 */
export const getTodayDate = (): Date => {
  return new Date();
};

/**
 * Obtiene el rango de fechas visible
 */
export const getVisibleDateRange = (currentDate: Date): { start: Date; end: Date } => {
  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

  return {
    start: startOfWeek(monthStart, { locale: es }),
    end: endOfWeek(monthEnd, { locale: es })
  };
};

/**
 * Obtiene las etiquetas de los días de la semana
 */
export const getWeekdayLabels = (): readonly string[] => {
  return ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'] as const;
};

/**
 * Verifica si un ejercicio fue entrenado hoy
 */
export const isExerciseTrainedToday = (exerciseId: string, workoutRecords: WorkoutRecord[]): boolean => {
  return workoutRecords.some(record =>
    record.exerciseId === exerciseId &&
    isDateToday(record.date)
  );
};

/**
 * Obtiene ejercicios entrenados hoy
 */
export const getExercisesTrainedToday = (workoutRecords: WorkoutRecord[]): string[] => {
  const todayRecords = workoutRecords.filter(record => isDateToday(record.date));
  return [...new Set(todayRecords.map(record => record.exerciseId))];
};

/**
 * Obtiene el día actual de la semana
 */
export const getCurrentDayOfWeek = (): string => {
  return format(new Date(), 'EEEE', { locale: es });
};

/**
 * Verifica si un ejercicio fue entrenado hoy y en el día correcto
 */
export const isExerciseTrainedTodayAndCorrectDay = (
  exerciseId: string,
  workoutRecords: WorkoutRecord[],
  currentTabDay: string
): boolean => {
  const today = new Date();
  const todayDayName = format(today, 'EEEE', { locale: es });

  return todayDayName === currentTabDay &&
    isExerciseTrainedToday(exerciseId, workoutRecords);
};

/**
 * Obtiene ejercicios entrenados hoy para el día actual
 */
export const getExercisesTrainedTodayForCurrentDay = (
  workoutRecords: WorkoutRecord[],
  currentTabDay: string
): string[] => {
  const today = new Date();
  const todayDayName = format(today, 'EEEE', { locale: es });

  if (todayDayName !== currentTabDay) {
    return [];
  }

  return getExercisesTrainedToday(workoutRecords);
}; 