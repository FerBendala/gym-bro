import type { DayOfWeek } from '@/interfaces';

export interface ModernHomeProps {
  activeDay: DayOfWeek;
  onDayChange: (day: DayOfWeek) => void;
  onOpenAdmin: () => void;
  onGoToHistory?: (exerciseId: string, exerciseName: string) => void;
}

export interface DayInfo {
  isToday: boolean;
  dayIndex: number;
  formattedDate: string;
}

export interface DaySelectorProps {
  activeDay: DayOfWeek;
  onDayChange: (day: DayOfWeek) => void;
}

export interface QuickDayNavigationProps {
  activeDay: DayOfWeek;
  onDayChange: (day: DayOfWeek) => void;
} 