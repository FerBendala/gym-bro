import React from 'react';

import {
  CalendarGrid,
  CalendarHeader,
  CalendarLegend,
  CalendarStats,
  CalendarWeekdays,
} from './components';
import { useWorkoutCalendar } from './hooks';
import type { WorkoutCalendarProps } from './types';

import { THEME_CALENDAR } from '@/constants/theme';
import { useNavigateTo } from '@/stores/modern-layout';
import { type CalendarDayData } from '@/utils';

/**
 * Componente WorkoutCalendar refactorizado con arquitectura modular
 * - Hook específico para lógica de estado y cálculos
 * - Subcomponentes modulares especializados
 * - Sistema de tema genérico
 * - Utilidades reutilizables para calendarios
 */
export const WorkoutCalendar: React.FC<WorkoutCalendarProps> = ({ records }) => {
  const {
    headerTitle,
    weekdayLabels,
    calendarDays,
    legendData,
    monthStats,
    goToPreviousMonth,
    goToNextMonth,
  } = useWorkoutCalendar(records);
  const navigateTo = useNavigateTo();

  const handleDayClick = (dayData: CalendarDayData) => {
    const date = dayData.date;
    const dateFrom = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
    const dateTo = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
    const dateLabel = date.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });

    navigateTo('history', { dateFrom, dateTo, dateLabel });
  };

  return (
    <div className={THEME_CALENDAR.container}>
      <CalendarHeader
        title={headerTitle}
        onPreviousMonth={goToPreviousMonth}
        onNextMonth={goToNextMonth}
      />

      <CalendarWeekdays weekdayLabels={weekdayLabels} />

      <CalendarGrid
        calendarDays={calendarDays}
        onDayClick={handleDayClick}
      />

      <CalendarLegend legendData={legendData} />

      <CalendarStats stats={monthStats} />
    </div>
  );
};
