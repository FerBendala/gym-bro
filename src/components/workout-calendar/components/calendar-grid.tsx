import { THEME_CALENDAR } from '@/constants/theme';
import { cn } from '@/utils';
import React from 'react';
import type { CalendarGridProps } from '../types';

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  calendarDays,
  onDayClick
}) => {
  return (
    <div className={THEME_CALENDAR.grid.container}>
      {calendarDays.map((dayData, index) => (
        <div
          key={index}
          className={cn(
            THEME_CALENDAR.grid.day.base,
            dayData.isCurrentMonth
              ? THEME_CALENDAR.grid.day.currentMonth
              : THEME_CALENDAR.grid.day.otherMonth,
            dayData.isToday && THEME_CALENDAR.grid.day.today,
            dayData.hasData && THEME_CALENDAR.grid.day.hasData,
            dayData.hasData && dayData.intensity // Solo aplicar intensidad si tiene datos
          )}
          onClick={() => onDayClick?.(dayData)}
          title={dayData.hasData ? `${dayData.workouts.length} entrenamientos` : ''}
        >
          <span className={THEME_CALENDAR.grid.day.content}>
            {dayData.dayNumber}
          </span>
          {dayData.hasData && (
            <div className={THEME_CALENDAR.grid.day.indicator}>
              <div className={THEME_CALENDAR.grid.day.dot}></div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}; 