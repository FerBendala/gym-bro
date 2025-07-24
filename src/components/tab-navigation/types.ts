import type { ThemeTabSize, ThemeTabVariant } from '@/constants/theme';
import type { DayOfWeek } from '@/interfaces';

export interface TabNavigationProps {
  activeDay: DayOfWeek;
  onDayChange: (day: DayOfWeek) => void;
  size?: ThemeTabSize;
  variant?: ThemeTabVariant;
}

export interface TabButtonProps {
  day: DayOfWeek;
  isActive: boolean;
  onClick: (day: DayOfWeek) => void;
  size?: ThemeTabSize;
  variant?: ThemeTabVariant;
  isMobile?: boolean;
}

export interface TabContainerProps {
  children: React.ReactNode;
  isMobile?: boolean;
} 