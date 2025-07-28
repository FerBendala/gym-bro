import { THEME_CALENDAR } from '@/constants/theme/index.constants';
import { cn } from '@/utils';
import React from 'react';
import type { CalendarLegendProps } from '../types';

export const CalendarLegend: React.FC<CalendarLegendProps> = ({ legendData }) => {
  return (
    <div className={THEME_CALENDAR.legend.container}>
      <span className={THEME_CALENDAR.legend.label}>Menos</span>
      <div className={THEME_CALENDAR.legend.dots}>
        {legendData.map((item, index) => (
          <div
            key={index}
            className={cn(THEME_CALENDAR.legend.dot, item.className)}
          />
        ))}
      </div>
      <span className={THEME_CALENDAR.legend.label}>Más</span>
    </div>
  );
}; 