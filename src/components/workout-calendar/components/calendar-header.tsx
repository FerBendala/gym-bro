import { THEME_CALENDAR } from '@/constants/theme';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React from 'react';
import { Button } from '../../button';
import type { CalendarHeaderProps } from '../types';

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  title,
  onPreviousMonth,
  onNextMonth
}) => {
  return (
    <div className={THEME_CALENDAR.header.container}>
      <h4 className={THEME_CALENDAR.header.title}>
        {title}
      </h4>
      <div className={THEME_CALENDAR.header.navigation}>
        <Button variant="ghost" size="sm" onClick={onPreviousMonth}>
          <ChevronLeft className={THEME_CALENDAR.header.navButton} />
        </Button>
        <Button variant="ghost" size="sm" onClick={onNextMonth}>
          <ChevronRight className={THEME_CALENDAR.header.navButton} />
        </Button>
      </div>
    </div>
  );
}; 