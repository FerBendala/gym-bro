import type { ThemeStatCardSize, ThemeStatCardVariant } from '@/constants/theme/index.constants';
import type { LucideIcon } from 'lucide-react';

export interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  variant?: ThemeStatCardVariant;
  size?: ThemeStatCardSize;
  className?: string;
  tooltip?: string;
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
}

export interface StatCardContentProps {
  title: string;
  value: string;
  icon: LucideIcon;
  variant: ThemeStatCardVariant;
  size: ThemeStatCardSize;
  className?: string;
}

export interface StatCardIconProps {
  icon: LucideIcon;
  variant: ThemeStatCardVariant;
  size: ThemeStatCardSize;
}

export interface StatCardTextProps {
  title: string;
  value: string;
  size: ThemeStatCardSize;
} 