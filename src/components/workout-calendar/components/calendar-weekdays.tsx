import { THEME_CALENDAR } from '@/constants/theme/index.constants';
import React from 'react';
import type { CalendarWeekdaysProps } from '../types';

export const CalendarWeekdays: React.FC<CalendarWeekdaysProps> = ({ weekdayLabels }) => {
  return (
    <div className={THEME_CALENDAR.weekdays.container}>
      {weekdayLabels.map((day, index) => (
        <div key={index} className={THEME_CALENDAR.weekdays.day}>
          {day}
        </div>
      ))}
    </div>
  );
}; 