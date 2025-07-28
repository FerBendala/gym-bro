import { THEME_CALENDAR } from '@/constants/theme';
import React from 'react';
import type { CalendarStatsProps } from '../types';

export const CalendarStats: React.FC<CalendarStatsProps> = ({ stats }) => {
  return (
    <div className={THEME_CALENDAR.stats.container}>
      <div className={THEME_CALENDAR.stats.grid}>
        <div>
          <p className={THEME_CALENDAR.stats.item.value}>
            {stats.daysWithWorkouts}
          </p>
          <p className={THEME_CALENDAR.stats.item.label}>
            Días entrenados
          </p>
        </div>
        <div>
          <p className={THEME_CALENDAR.stats.item.value}>
            {stats.totalWorkouts}
          </p>
          <p className={THEME_CALENDAR.stats.item.label}>
            Total ejercicios
          </p>
        </div>
      </div>
    </div>
  );
}; 