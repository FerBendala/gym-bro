import React from 'react';
import { THEME_CALENDAR } from '../../../constants/theme';
import { cn } from '../../../utils/functions/style-utils';
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