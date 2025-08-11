import React from 'react';

import type { CalendarGridProps } from '../types';

import { THEME_CALENDAR } from '@/constants/theme';
import { cn } from '@/utils';

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  calendarDays,
  onDayClick,
}) => {
  return (
    <div
      className={cn(
        THEME_CALENDAR.grid.container,
        'grid-cols-7 gap-1 sm:gap-1.5 md:gap-2',
      )}
    >
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
            dayData.hasData && dayData.intensity,
            'border border-gray-700/40 hover:border-gray-600/60 hover:shadow-md transition-all duration-150',
            'hover:ring-1 hover:ring-emerald-400/30',
          )}
          onClick={() => onDayClick?.(dayData)}
          title={dayData.hasData ? `${dayData.workouts.length} entrenamientos` : ''}
        >
          <span className={THEME_CALENDAR.grid.day.content}>{dayData.dayNumber}</span>
          {dayData.hasData && (
            <span className="absolute -top-1 -right-1 sm:top-0 sm:right-0 text-[9px] sm:text-[10px] leading-4 px-1.5 py-0.5 rounded-full bg-emerald-600/70 text-white border border-emerald-300/20 shadow-sm">
              {dayData.workouts.length}
            </span>
          )}
          {dayData.hasData && (
            <div className={THEME_CALENDAR.grid.day.indicator}>
              <div className={THEME_CALENDAR.grid.day.dot} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
