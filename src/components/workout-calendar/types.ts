import type { WorkoutRecord } from '@/interfaces';
import type { CalendarDayData, CalendarStats } from '@/utils';

/**
 * Interfaces específicas para WorkoutCalendar
 */

export interface WorkoutCalendarProps {
  records: WorkoutRecord[];
}

export interface CalendarHeaderProps {
  title: string;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
}

export interface CalendarGridProps {
  calendarDays: CalendarDayData[];
  onDayClick?: (day: CalendarDayData) => void;
}

export interface CalendarWeekdaysProps {
  weekdayLabels: readonly string[];
}

export interface CalendarLegendProps {
  legendData: {
    intensity: string;
    className: string;
  }[];
}

export interface CalendarStatsProps {
  stats: CalendarStats;
}
