import type { ThemeSpinnerColor, ThemeSpinnerSize, ThemeSpinnerVariant } from '@/constants/theme';

export interface LoadingSpinnerProps {
  size?: ThemeSpinnerSize;
  color?: ThemeSpinnerColor;
  variant?: ThemeSpinnerVariant;
  className?: string;
}

export interface SpinnerSVGProps {
  className: string;
} 