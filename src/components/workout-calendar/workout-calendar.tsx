import { THEME_CALENDAR } from '@/constants/theme/index.constants';
import React from 'react';
import type { CalendarDayData } from '../../utils/functions/calendar-utils';
import {
  CalendarGrid,
  CalendarHeader,
  CalendarLegend,
  CalendarStats,
  CalendarWeekdays
} from './components';
import { useWorkoutCalendar } from './hooks';
import type { WorkoutCalendarProps } from './types';

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
    goToNextMonth
  } = useWorkoutCalendar(records);

  const handleDayClick = (dayData: CalendarDayData) => {
    // Funcionalidad futura: abrir modal con detalles del día
    console.info('Día seleccionado:', dayData);
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