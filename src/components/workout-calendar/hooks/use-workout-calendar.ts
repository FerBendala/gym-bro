import type { WorkoutRecord } from '@/interfaces';
import {
  formatCalendarHeader,
  getCalendarDays,
  getDayData,
  getDayTooltip,
  getLegendData,
  getMonthStats,
  getWeekdayLabels,
  groupWorkoutsByDay,
  navigateToNextMonth,
  navigateToPreviousMonth,
  type CalendarDayData
} from '@/utils';
import { useMemo, useState } from 'react';

/**
 * Hook para manejar la lógica del calendario de entrenamientos
 * Maneja navegación, cálculos de días y estadísticas
 */
export const useWorkoutCalendar = (records: WorkoutRecord[]) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Cálculos memoizados para optimizar rendimiento
  const calendarData = useMemo(() => {
    return getCalendarDays(currentDate);
  }, [currentDate]);

  const workoutsByDay = useMemo(() => {
    return groupWorkoutsByDay(records);
  }, [records]);

  const calendarDays = useMemo(() => {
    return calendarData.days.map(day =>
      getDayData(day, currentDate, workoutsByDay)
    );
  }, [calendarData.days, currentDate, workoutsByDay]);

  const monthStats = useMemo(() => {
    return getMonthStats(records, currentDate, workoutsByDay);
  }, [records, currentDate, workoutsByDay]);

  const headerTitle = useMemo(() => {
    return formatCalendarHeader(currentDate);
  }, [currentDate]);

  const weekdayLabels = useMemo(() => {
    return getWeekdayLabels();
  }, []);

  const legendData = useMemo(() => {
    return getLegendData();
  }, []);

  // Funciones de navegación
  const goToPreviousMonth = () => {
    setCurrentDate(prev => navigateToPreviousMonth(prev));
  };

  const goToNextMonth = () => {
    setCurrentDate(prev => navigateToNextMonth(prev));
  };

  const goToDate = (date: Date) => {
    setCurrentDate(date);
  };

  // Función helper para obtener tooltip de día
  const getTooltipForDay = (dayData: CalendarDayData): string => {
    return getDayTooltip(dayData.workouts.length);
  };

  return {
    // Estado
    currentDate,

    // Datos calculados
    calendarDays,
    monthStats,
    headerTitle,
    weekdayLabels,
    legendData,

    // Funciones de navegación
    goToPreviousMonth,
    goToNextMonth,
    goToDate,

    // Helpers
    getTooltipForDay,

    // Datos raw para casos especiales
    workoutsByDay,
    calendarData
  };
}; 